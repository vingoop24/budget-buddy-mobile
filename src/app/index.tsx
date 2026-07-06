import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-chart-kit";


const API_URL = "http://127.0.0.1:8000";

export default function HomeScreen() {
  const [data, setData] = useState<any>(null);

  useFocusEffect(
  useCallback(() => {
    fetch(`${API_URL}/ai-insights`)
  .then((res) => {
    console.log("Status:", res.status);
    return res.json();
  })
  .then((json) => {
    console.log(json);
    setData(json);
  })
  .catch((error) => console.log("API error:", error));
  }, [])
);

const deleteExpense = async (expenseId: number) => {
  try {
    await fetch(`${API_URL}/expenses/${expenseId}`, {
      method: "DELETE",
    });

    const res = await fetch(`${API_URL}/ai-insights`);
    const json = await res.json();
    setData(json);
  } catch (error) {
    console.log(error);
  }
};

 const screenWidth = Dimensions.get("window").width;

  const pieData =
    data?.category_totals
    ? Object.entries(data.category_totals).map(
        ([category, amount], index) => ({
          name: category,
          population: amount as number,
          color: ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][index % 5],
          legendFontColor: "white",
          legendFontSize: 12,
        })
      )
    : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Budget Buddy 💸</Text>
      <Text style={styles.subtitle}>AI-Powered Finance Assistant</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Monthly Budget</Text>
        <Text style={styles.cardValue}>${data?.monthly_budget ?? "Loading..."}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Spent</Text>
        <Text style={styles.spent}>${data?.total_spent ?? "Loading..."}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Remaining</Text>
        <Text style={styles.remaining}>${data?.remaining ?? "Loading..."}</Text>
      </View>

        <Text style={styles.sectionTitle}>Spending Breakdown</Text>

        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: () => "white",
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        ) : null}

      <Text style={styles.sectionTitle}>AI Insights</Text>

      {data?.insights?.map((insight: string, index: number) => (
        <View key={index} style={styles.expenseItem}>
          <Text style={styles.expenseText}>{insight}</Text>
        </View>
      ))}

            <Link href="/ai-assistant" asChild>
        <TouchableOpacity style={styles.aiButton}>
          <Text style={styles.aiText}>Open AI Assistant 🤖</Text>
        </TouchableOpacity>
      </Link>
  
  <Link href="/scan-receipt" asChild>
    <TouchableOpacity style={styles.scanButton}>
      <Text style={styles.aiText}>Scan Receipt 📸</Text>
    </TouchableOpacity>
  </Link>

  <Text style={styles.sectionTitle}>Recent Expenses</Text>

{data?.recent_expenses?.map((expense: any, index: number) => {
  const emoji =
    expense.category?.toLowerCase().includes("restaurant") ? "🍽️" :
    expense.category?.toLowerCase().includes("food") ? "🍔" :
    expense.category?.toLowerCase().includes("coffee") ? "☕" :
    expense.category?.toLowerCase().includes("travel") ? "✈️" :
    expense.category?.toLowerCase().includes("transport") ? "🚗" :
    "💳";

 

  return (
   <View key={index} style={styles.expenseItem}>
  <View>
    <Text style={styles.expenseText}>{expense.merchant}</Text>
    <Text style={styles.expenseSubText}>
      {expense.currency} {expense.amount}
    </Text>
  </View>

  <TouchableOpacity
    style={styles.deleteButton}
    onPress={() => deleteExpense(expense.id)}
  >
    <Text style={styles.deleteText}>🗑 Delete</Text>
  </TouchableOpacity>
</View>
  );
})}

    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "white",
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#1F2937",
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
  },
  cardLabel: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  cardValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  spent: {
    color: "#F87171",
    fontSize: 28,
    fontWeight: "bold",
  },
  remaining: {
    color: "#34D399",
    fontSize: 28,
    fontWeight: "bold",
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
  },
  expenseItem: {
  backgroundColor: "#1F2937",
  padding: 16,
  borderRadius: 12,
  marginBottom: 10,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},
  expenseText: {
    color: "white",
    fontSize: 15,
  },
  aiButton: {
    marginTop: 30,
    backgroundColor: "#2563EB",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  aiText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  scanButton: {
  marginTop: 15,
  backgroundColor: "#10B981",
  padding: 18,
  borderRadius: 16,
  alignItems: "center",
},

expenseSubText: {
  color: "#9CA3AF",
  fontSize: 13,
  marginTop: 4,
},

deleteButton: {
  backgroundColor: "#DC2626",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 10,
},

deleteText: {
  color: "white",
  fontWeight: "bold",
  fontSize: 12,
},

});