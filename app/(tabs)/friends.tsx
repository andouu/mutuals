import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GLOBAL_COLORS, GLOBAL_CONSTANTS } from "../globals";
import { Entypo } from "@expo/vector-icons";
import { auth } from "@/firebase/init";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firestore";

export default function Friends() {
  const [addingNewFriend, setAddingNewFriend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchingFriends, setSearchingFriends] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");

  const handleSearchFriend = async () => {
    try {
      if (!auth.currentUser || !search) {
        return;
      }

      const discriminatorIndex = search.lastIndexOf("#");
      if (discriminatorIndex === -1) {
        return;
      }
      const discriminator = search.substring(discriminatorIndex + 1);
      const name = search.substring(0, discriminatorIndex);
      if (!name || !discriminator) {
        return;
      }

      setSearchingFriends(true);

      const userQuery = await getDocs(
        query(
          collection(db, "users"),
          where("username", "==", name),
          where("discriminator", "==", discriminator)
        )
      );

      if (userQuery.size === 0) {
        setSearchError("User doesn't exist!");
        return;
      }

      const userInfo = userQuery.docs[0];
      const otherUserUid = userInfo.id;

      // check if already friended
      const friendshipSnapshot = await getDocs(
        query(collection(db, "friends"), where("friendUid", "==", otherUserUid))
      );
      if (friendshipSnapshot.size > 0) {
        setSearchError("You are already friends with this person!");
        return;
      }

      await addDoc(collection(db, "friends"), {
        userUid: auth.currentUser.uid,
        friendUid: otherUserUid,
      });

      await addDoc(collection(db, "friends"), {
        userUid: otherUserUid,
        friendUid: auth.currentUser.uid,
      });

      setSearch("");
      setSearchError("");
      setAddingNewFriend(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingFriends(false);
    }
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ThemedView
      style={{ width: "100%", height: "100%", backgroundColor: "white" }}
    >
      <SafeAreaView>
        <View style={styles.wrapper}>
          <Pressable
            style={({ pressed }) => [
              styles.addFriendButton,
              pressed ? styles.pressed : undefined,
            ]}
            onPress={() => setAddingNewFriend(true)}
          >
            <Entypo name="plus" size={35} color="white" />
          </Pressable>
          <Modal animationType="slide" transparent visible={addingNewFriend}>
            <SafeAreaView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitleText}>Add New Friend</Text>
                <Pressable
                  style={({ pressed }) => [
                    pressed ? styles.pressed : undefined,
                  ]}
                  onPress={() => setAddingNewFriend(false)}
                >
                  <Text style={styles.closeModalText}>Close</Text>
                </Pressable>
              </View>
              <View style={styles.modalContent}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <TextInput
                    style={styles.input}
                    value={search}
                    onChangeText={(newUsername) => {
                      setSearchError("");
                      setSearch(newUsername);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {searchError && <Text style={styles.error}>{searchError}</Text>}
                <Pressable
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed ? styles.pressed : undefined,
                    searchingFriends || search.length === 0
                      ? styles.disabled
                      : undefined,
                  ]}
                  onPress={handleSearchFriend}
                  disabled={searchingFriends || search.length === 0}
                >
                  {searchingFriends ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.addText}>Add Friend</Text>
                  )}
                </Pressable>
              </View>
            </SafeAreaView>
          </Modal>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: GLOBAL_CONSTANTS.px,
    backgroundColor: "white",
  },
  wrapper: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
  },
  addFriendButton: {
    position: "absolute",
    bottom: GLOBAL_CONSTANTS.px,
    right: GLOBAL_CONSTANTS.px,
    width: 65,
    height: 65,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 99,
    backgroundColor: GLOBAL_COLORS.brandColor,
  },
  pressed: {
    opacity: 0.65,
  },
  modalContainer: {
    width: "100%",
    height: "100%",
    paddingHorizontal: GLOBAL_CONSTANTS.px,
    backgroundColor: "white",
  },
  modalHeader: {
    height: 75,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: GLOBAL_CONSTANTS.px,
  },
  modalTitleText: {
    fontFamily: "NeueMontrealMedium",
    fontSize: 25,
  },
  closeModalText: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "NeueMontrealMedium",
    fontSize: 18,
  },
  modalContent: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 150,
    paddingHorizontal: GLOBAL_CONSTANTS.px,
  },
  inputWrapper: {
    width: "100%",
  },
  inputLabel: {
    marginBottom: 5,
    color: GLOBAL_COLORS.darkGray,
    fontFamily: "NeueMontrealMedium",
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GLOBAL_COLORS.lightGray,
    borderRadius: 5,
    fontFamily: "NeueMontrealMedium",
  },
  error: {
    alignSelf: "flex-start",
    marginTop: 15,
    color: GLOBAL_COLORS.red,
    fontFamily: "NeueMontrealMedium",
  },
  addButton: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    borderRadius: 5,
    backgroundColor: GLOBAL_COLORS.brandColor,
  },
  addText: {
    color: "white",
    fontFamily: "NeueMontrealMedium",
  },
  disabled: {
    opacity: 0.65,
  },
});
