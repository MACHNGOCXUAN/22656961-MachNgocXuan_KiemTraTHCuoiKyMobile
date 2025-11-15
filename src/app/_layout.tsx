import { SQLiteProvider } from "expo-sqlite";
import "../global.css";
import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initExpensesTable } from "@/database/db";
import { AntDesign } from "@expo/vector-icons"; // <-- import icon

export default function Layout() {
  return (
    <SQLiteProvider databaseName="expense.db" onInit={(db) => initExpensesTable(db)}>
      <SafeAreaProvider>
        <Tabs
          screenOptions={{
            headerShown: true,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Chi tiêu",
              tabBarLabel: "Expenses",
              tabBarIcon: ({ color, size }) => (
                <AntDesign name="credit-card" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaProvider>
    </SQLiteProvider>
  );
}
