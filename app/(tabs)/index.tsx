import { ThemedView } from "@/components/ThemedView";
import { db } from "@/firebase/firestore";
import { auth } from "@/firebase/init";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GLOBAL_COLORS, GLOBAL_CONSTANTS } from "../globals";
import { INTERESTS } from "../(onboard)/interests";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { UserInfo } from "./settings";
import { storage } from "@/firebase/fireStorage";
import { getDownloadURL, ref } from "firebase/storage";

type Invite = {
  status: "pending" | "accepted" | "rejected";
  eventDetails: {
    activityId: string;
    when: Timestamp;
    where: string;
  };
  hostUid: string;
  inviteeUid: string;
  inviteeUids: string[];
};

type Friendship = {
  userUid: string;
  friendUid: string;
};

export default function Invites() {
  const [invite, setInvite] = useState<Invite>();
  const [friends, setFriends] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedInterest, setSelectedInterest] = useState<string>();
  const [selectedWhen, setSelectedWhen] = useState<Date>(new Date());
  const [selectedWhere, setSelectedWhere] = useState<string>("");
  const [selectedInvitees, setSelectedInvitees] = useState<number>();
  const [sendingInvites, setSendingInvites] = useState<boolean>(false);

  const [inviteParsed, setInviteParsed] = useState<{
    host: UserInfo & { pfpB64: string; uid: string };
    users: (UserInfo & { pfpB64: string; uid: string })[];
  }>();

  const handleSelectInterest = (interestId: string) => {
    setSelectedInterest(interestId);
  };

  const handleSelectInvitees = (number: number) => {
    setSelectedInvitees(number);
  };

  const handleSelectDateTime = (_evt: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setSelectedWhen(date);
    }
  };

  const handleSendInvites = async () => {
    try {
      if (
        !selectedInterest ||
        !selectedWhen ||
        !selectedWhere ||
        !selectedInvitees ||
        !auth.currentUser ||
        friends.length === 0
      ) {
        return;
      }

      setSendingInvites(true);

      const inviteeUids: string[] = [];
      const inviteeSet = new Set();
      while (inviteeUids.length < Math.min(friends.length, selectedInvitees)) {
        let selectedUser;
        do {
          selectedUser = friends[Math.floor(Math.random() * friends.length)];
          console.log(selectedUser);
        } while (inviteeSet.has(selectedUser));

        inviteeUids.push(selectedUser);
        inviteeSet.add(selectedUser);
      }

      const eventDetails = {
        activityId: selectedInterest,
        when: Timestamp.fromDate(selectedWhen),
        where: selectedWhere,
      };

      for (const inviteeUid of inviteeUids) {
        const newInvite: Invite = {
          status: "pending",
          eventDetails,
          hostUid: auth.currentUser.uid,
          inviteeUid,
          inviteeUids,
        };

        await setDoc(doc(db, "invites", inviteeUid), newInvite);
      }

      await setDoc(doc(db, "invites", auth.currentUser.uid), {
        status: "accepted",
        eventDetails,
        hostUid: auth.currentUser.uid,
        inviteeUid: auth.currentUser.uid,
        inviteeUids,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSendingInvites(false);
    }
  };

  useEffect(() => {
    const getFriends = async () => {
      try {
        if (!auth.currentUser) {
          return;
        }

        setLoading(true);

        const friendsSnapshot = await getDocs(
          query(
            collection(db, "friends"),
            where("userUid", "==", auth.currentUser.uid)
          )
        );

        setFriends(friendsSnapshot.docs.map((doc) => doc.data().friendUid));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!auth.currentUser) {
      return;
    }

    getFriends();

    const inviteRef = doc(db, "invites", auth.currentUser.uid);
    const unsubscribe = onSnapshot(inviteRef, (snapshot) => {
      setLoading(true);
      setInvite(snapshot.data() as Invite);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!invite) {
      return;
    }

    const fetchDetails = async () => {
      const userUids = [invite.hostUid, ...invite.inviteeUids];

      const metadatas = await Promise.all(
        userUids.map(async (uid) => {
          const userInfo = await getDoc(doc(db, "users", uid));
          const pfpRef = ref(storage, uid + ".jpg");
          const pfpUrl = await getDownloadURL(pfpRef);

          const pfpRes = await fetch(pfpUrl);
          const pfpB64 = await pfpRes.text();
          return { ...userInfo.data(), pfpB64, uid } as UserInfo & {
            pfpB64: string;
            uid: string;
          };
        })
      );

      setInviteParsed({
        host: metadatas[0],
        users: metadatas.slice(1),
      });
    };

    fetchDetails();
  }, [invite]);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator />
      </View>
    );
  }

  const canInvite =
    selectedInterest &&
    selectedWhen &&
    selectedWhere &&
    selectedInvitees &&
    friends.length > 0;

  return (
    <ThemedView
      style={{ width: "100%", height: "100%", backgroundColor: "white" }}
    >
      <SafeAreaView>
        <View style={styles.wrapper}>
          {!invite ? (
            <>
              <Text style={styles.title}>Invites</Text>

              <Text style={styles.description}>
                It looks like you don't have any invites.
              </Text>
              <Text style={styles.description}>Create one below!</Text>
              <View style={styles.option}>
                <Text style={styles.label}>Activity</Text>
                <View style={styles.interests}>
                  {INTERESTS.map((interest) => (
                    <Pressable
                      key={interest.id}
                      style={[
                        styles.interest,
                        selectedInterest === interest.id
                          ? styles.selected
                          : undefined,
                      ]}
                      onPress={() => handleSelectInterest(interest.id)}
                    >
                      <Text
                        style={[
                          styles.interestText,
                          selectedInterest === interest.id
                            ? styles.interestTextSelected
                            : undefined,
                        ]}
                      >
                        {interest.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={styles.option}>
                <Text style={styles.label}>When</Text>
                <View style={styles.interests}>
                  <DateTimePicker
                    testID="date-time-picker"
                    value={selectedWhen}
                    mode="datetime"
                    onChange={handleSelectDateTime}
                  />
                </View>
              </View>
              <View style={styles.option}>
                <Text style={styles.label}>Where</Text>
                <View style={styles.interests}>
                  <TextInput
                    style={styles.input}
                    value={selectedWhere}
                    onChangeText={setSelectedWhere}
                    placeholder="e.g. Sharetea"
                  />
                </View>
              </View>
              <View style={styles.option}>
                <Text style={styles.label}>Invites</Text>
                <View style={styles.interests}>
                  <Pressable
                    style={[
                      styles.interest,
                      selectedInvitees === 1 ? styles.selected : undefined,
                    ]}
                    onPress={() => handleSelectInvitees(1)}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        selectedInvitees === 1
                          ? styles.interestTextSelected
                          : undefined,
                      ]}
                    >
                      1 Person
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.interest,
                      selectedInvitees === 2 ? styles.selected : undefined,
                    ]}
                    onPress={() => handleSelectInvitees(2)}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        selectedInvitees === 2
                          ? styles.interestTextSelected
                          : undefined,
                      ]}
                    >
                      2 People
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.interest,
                      selectedInvitees === 3 ? styles.selected : undefined,
                    ]}
                    onPress={() => handleSelectInvitees(3)}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        selectedInvitees === 3
                          ? styles.interestTextSelected
                          : undefined,
                      ]}
                    >
                      3 People
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.interest,
                      selectedInvitees === 4 ? styles.selected : undefined,
                    ]}
                    onPress={() => handleSelectInvitees(4)}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        selectedInvitees === 4
                          ? styles.interestTextSelected
                          : undefined,
                      ]}
                    >
                      4+ People
                    </Text>
                  </Pressable>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  pressed ? styles.sendButtonPressed : undefined,
                  !canInvite ? styles.sendButtonDisabled : undefined,
                ]}
                onPress={handleSendInvites}
                disabled={!canInvite}
              >
                {sendingInvites ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.sendButtonText}>Send Invites</Text>
                )}
              </Pressable>
            </>
          ) : invite.status === "pending" || true ? (
            <>
              <Text style={styles.title}>New Invite!</Text>
              <View style={styles.meta}>
                <Text style={styles.heading}>
                  Activity —{" "}
                  {
                    INTERESTS[
                      INTERESTS.findIndex(
                        (interest) =>
                          interest.id === invite.eventDetails.activityId
                      )
                    ].name
                  }
                </Text>
                <View style={styles.whenWhere}>
                  <View style={styles.metaDetail}>
                    <Text style={styles.metaLabel}>When</Text>
                    <Text style={styles.metaData}>
                      {invite.eventDetails.when.toDate().toLocaleDateString()} @{" "}
                      {invite.eventDetails.when
                        .toDate()
                        .toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </Text>
                  </View>
                  <View style={styles.metaDetail}>
                    <Text style={styles.metaLabel}>Where</Text>
                    <Text style={styles.metaData}>
                      {invite.eventDetails.where}
                    </Text>
                  </View>
                </View>
                <View style={styles.host}>
                  <Text style={styles.metaLabel}>Host</Text>
                  <View style={styles.hostUser}>
                    <Image
                      style={styles.hostPfp}
                      source={{
                        uri: `data:image/jpeg;base64,${inviteParsed?.host.pfpB64}`,
                      }}
                    />
                    <Text style={styles.hostUsername}>
                      {inviteParsed?.host.name}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.attendeesHeading}>
                {invite.inviteeUids.length + 1} Invites
              </Text>
              <View style={styles.inviteeList}>
                <View style={styles.invitee}>
                  <Image
                    style={styles.inviteePfp}
                    source={{
                      uri: `data:image/jpeg;base64,${
                        inviteParsed?.host.pfpB64 || ""
                      }`,
                    }}
                  />
                  <Text style={styles.inviteeName}>
                    {inviteParsed?.host.username}
                  </Text>
                </View>
                {invite.inviteeUids.map((inviteeUid) => (
                  <View key={inviteeUid} style={styles.invitee}>
                    <Image
                      style={styles.inviteePfp}
                      source={{
                        uri: `data:image/jpeg;base64,${
                          inviteParsed?.users.find(
                            (user) => user.uid === inviteeUid
                          )?.pfpB64 || ""
                        }`,
                      }}
                    />
                    <Text style={styles.inviteeName}>
                      {inviteParsed?.users.find(
                        (user) => user.uid === inviteeUid
                      )?.username || ""}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Event Details</Text>
            </>
          )}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  wrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: GLOBAL_CONSTANTS.px,
    backgroundColor: "white",
  },
  title: {
    marginBottom: 15,
    fontFamily: "NeueMontrealMedium",
    fontSize: 35,
  },
  description: {
    fontSize: 18,
    fontFamily: "NeueMontrealBook",
  },
  option: { marginTop: 15 },
  label: {
    marginBottom: 10,
    fontFamily: "NeueMontrealMedium",
    fontSize: 20,
  },
  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interest: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1.5,
    borderColor: GLOBAL_COLORS.lightGray,
    borderRadius: 99,
  },
  interestText: {
    color: GLOBAL_COLORS.darkGray,
    fontFamily: "NeueMontreal",
  },
  interestTextSelected: {
    color: GLOBAL_COLORS.brandColor,
  },
  selected: {
    borderColor: GLOBAL_COLORS.brandColor,
    color: GLOBAL_COLORS.brandColor,
    backgroundColor: GLOBAL_COLORS.greenShadow,
  },
  input: {
    width: "100%",
    height: 40,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GLOBAL_COLORS.lightGray,
    borderRadius: 5,
    fontFamily: "NeueMontrealMedium",
  },
  sendButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    borderRadius: 5,
    backgroundColor: GLOBAL_COLORS.brandColor,
  },
  sendButtonPressed: {
    opacity: 0.65,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: "white",
    fontFamily: "NeueMontrealMedium",
  },
  meta: {},
  heading: {
    marginBottom: 10,
    fontFamily: "NeueMontrealMedium",
    fontSize: 18,
  },
  whenWhere: {
    flexDirection: "row",
    gap: 10,
  },
  metaDetail: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaLabel: {
    fontFamily: "NeueMontrealMedium",
    fontSize: 16,
  },
  metaData: {
    fontFamily: "NeueMontrealBook",
  },
  host: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 10,
  },
  hostUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  hostPfp: {
    width: 30,
    height: 30,
    borderRadius: 99,
    overflow: "hidden",
  },
  hostUsername: {
    fontFamily: "NeueMontrealBook",
  },
  attendeesHeading: {
    marginTop: 20,
    marginBottom: 5,
    color: GLOBAL_COLORS.darkGray,
    fontFamily: "NeueMontrealMedium",
    fontSize: 14,
  },
  inviteeList: {
    marginTop: 10,
    gap: 10,
  },
  invitee: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  inviteePfp: {
    width: 35,
    height: 35,
    borderRadius: 99,
  },
  inviteeName: {
    fontFamily: "NeueMontrealMedium",
    fontSize: 18,
  },
});
