import { Expense } from "@/types";
import { SQLiteDatabase } from "expo-sqlite";

export const initExpensesTable = async (db: SQLiteDatabase) => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      paid INTEGER DEFAULT 1,
      created_at INTEGER
    );
  `);

  // Kiểm tra xem bảng đã có dữ liệu chưa
  const rows: Expense[] = await db.getAllAsync<Expense>(`
    SELECT * FROM expenses LIMIT 1
  `);

  if (rows.length === 0) {
    const now = Date.now();
    const sampleData: Expense[] = [
      { title: "Cà phê", amount: 30000, category: "Đồ uống", created_at: now },
      { title: "Ăn trưa", amount: 50000, category: "Ăn uống", created_at: now },
      {
        title: "Đi xe buýt",
        amount: 10000,
        category: "Di chuyển",
        created_at: now,
      },
    ];

    for (const expense of sampleData) {
      await db.runAsync(
        `INSERT INTO expenses (title, amount, category, paid, created_at) VALUES (?, ?, ?, ?, ?)`,
        [
          expense.title,
          expense.amount,
          expense.category ?? null,
          expense.paid ?? 1,
          expense.created_at,
        ]
      );
    }

    console.log("Seeded sample expenses!");
  }
};

export const createExpense = async (db: SQLiteDatabase, data: Expense) => {
  const created_at = Date.now();
  await db.runAsync(
    `INSERT INTO expenses (title, amount, category, paid, created_at) VALUES (?, ?, ?, ?, ?)`,
    [data.title, data.amount, data.category ?? null, data.paid ?? 1, created_at]
  );
};

// Lấy tất cả
export const getAllExpenses = async (db: SQLiteDatabase) => {
  return await db.getAllAsync<Expense>(`
    SELECT * FROM expenses ORDER BY created_at DESC
  `);
};

// Lấy theo id
export const getExpenseById = async (db: SQLiteDatabase, id: number) => {
  return await db.getFirstAsync<Expense>(
    `SELECT * FROM expenses WHERE id = ?`,
    [id]
  );
};

export const updateExpense = async (db: SQLiteDatabase, data: Expense) => {
  await db.runAsync(
    `UPDATE expenses SET title = ?, amount = ?, category = ?, paid = ? WHERE id = ?`,
    [data.title, data.amount, data.category ?? null, data.paid ?? 1, data.id]
  );
};

export const deleteExpense = async (db: SQLiteDatabase, id: number) => {
  await db.runAsync(`DELETE FROM expenses WHERE id = ?`, [id]);
};
