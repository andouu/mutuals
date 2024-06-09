import { ThemedView } from "@/components/ThemedView";
import { db } from "@/firebase/firestore";
import { auth } from "@/firebase/init";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function Invites() {
  const [invite, setInvite] = useState<Invite>();
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedInterest, setSelectedInterest] = useState<string>();
  const [selectedWhen, setSelectedWhen] = useState<Date>(new Date());
  const [selectedWhere, setSelectedWhere] = useState<string>("");
  const [selectedInvitees, setSelectedInvitees] = useState<number>();
  const [sendingInvites, setSendingInvites] = useState<boolean>(false);

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
        !auth.currentUser
      ) {
        return;
      }

      setSendingInvites(true);

      // TODO: Call the server here to get the recommendations (as user IDs)
      // const inviteeUids: string[] = await fetch('http://localhost:6969', {

      // });
      const inviteeUids: string[] = [];

      for (const inviteeUid of inviteeUids) {
        const newInvite: Invite = {
          status: "pending",
          eventDetails: {
            activityId: selectedInterest,
            when: Timestamp.fromDate(selectedWhen),
            where: selectedWhere,
          },
          hostUid: auth.currentUser.uid,
          inviteeUid,
          inviteeUids,
        };

        setDoc(doc(db, "invites", inviteeUid), newInvite);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingInvites(false);
    }
  };

  useEffect(() => {
    const getInvite = async () => {
      try {
        if (!auth.currentUser) {
          return;
        }

        setLoading(true);

        const inviteQuery = query(
          collection(db, "invites"),
          where("inviteeUid", "==", auth.currentUser.uid),
          where("hostUid", "==", auth.currentUser.uid)
        );
        const snapshot = await getDocs(inviteQuery);
        if (snapshot.size > 0) {
          setInvite(snapshot.docs[0].data() as Invite);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getInvite();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator />
      </View>
    );
  }

  const canInvite =
    selectedInterest && selectedWhen && selectedWhere && selectedInvitees;

  return (
    <ThemedView
      style={{ width: "100%", height: "100%", backgroundColor: "white" }}
    >
      <SafeAreaView>
        <View style={styles.wrapper}>
          <Text style={styles.title}>{invite ? "New Invite!" : "Invites"}</Text>
          {!invite ? (
            <>
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
                <Text style={styles.sendButtonText}>Send Invites</Text>
              </Pressable>
            </>
          ) : null}
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
});
