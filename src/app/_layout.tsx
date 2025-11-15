import { SQLiteProvider } from "expo-sqlite";
import "../global.css";
import { Slot, Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initExpensesTable } from "@/database/db";

export default function Layout() {
  return <SQLiteProvider databaseName="expense.db" onInit={(db) => initExpensesTable(db)}>
    <SafeAreaProvider>
    <Tabs>
      
    </Tabs>
    </SafeAreaProvider>
  </SQLiteProvider>
}
