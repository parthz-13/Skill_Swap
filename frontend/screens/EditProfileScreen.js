import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { userAPI } from "../services/api";

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getMe();
      const user = response.data;
      setName(user.name);
      setBio(user.bio || "");
      setSkillsOffered(user.skillsOffered.join(", "));
      setSkillsWanted(user.skillsWanted.join(", "));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to load profile");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setLoading(true);
      await userAPI.updateMe({
        name: name.trim(),
        bio: bio.trim(),
        skillsOffered: skillsOffered
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        skillsWanted: skillsWanted
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
      });
      Alert.alert("Success", "Profile updated!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          placeholder="Tell others about yourself..."
        />

        <Text style={styles.label}>Skills I Can Teach</Text>
        <Text style={styles.hint}>
          Separate with commas (e.g., JavaScript, Guitar, Photography)
        </Text>
        <TextInput
          style={styles.input}
          value={skillsOffered}
          onChangeText={setSkillsOffered}
          placeholder="JavaScript, Guitar, Photography"
        />

        <Text style={styles.label}>Skills I Want to Learn</Text>
        <Text style={styles.hint}>Separate with commas</Text>
        <TextInput
          style={styles.input}
          value={skillsWanted}
          onChangeText={setSkillsWanted}
          placeholder="Python, Cooking, Spanish"
        />

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Saving..." : "Save Profile"}
            onPress={handleSave}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 5,
  },
  hint: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
});
