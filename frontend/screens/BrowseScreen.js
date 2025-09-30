import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Button,
  RefreshControl,
} from "react-native";
import { userAPI } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BrowseScreen({ navigation, onLogout }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.browse();
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

    const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    onLogout(); 
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.bio}>{item.bio || "No bio yet"}</Text>

      {item.skillsOffered.length > 0 && (
        <>
          <Text style={styles.label}>✨ Can teach:</Text>
          <View style={styles.skillsContainer}>
            {item.skillsOffered.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {item.skillsWanted.length > 0 && (
        <>
          <Text style={styles.label}>🎯 Wants to learn:</Text>
          <View style={styles.skillsContainer}>
            {item.skillsWanted.map((skill, index) => (
              <View key={index} style={[styles.skillBadge, styles.wantedBadge]}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="My Profile"
          onPress={() => navigation.navigate("Profile")}
        />
        <Button title="Logout" onPress={handleLogout} color="#dc3545" />

      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>
            Be the first to add your skills!
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#212529",
  },
  bio: {
    color: "#6c757d",
    marginBottom: 15,
    fontSize: 14,
  },
  label: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 8,
    fontSize: 14,
    color: "#495057",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  skillBadge: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  wantedBadge: {
    backgroundColor: "#28a745",
  },
  skillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6c757d",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#adb5bd",
  },
});
