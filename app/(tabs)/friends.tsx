import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GLOBAL_COLORS, GLOBAL_CONSTANTS } from "../globals";
import { Entypo } from "@expo/vector-icons";

export default function Friends() {
  const [addingNewFriend, setAddingNewFriend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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
});
