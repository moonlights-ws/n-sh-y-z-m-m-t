import { pgTable, serial, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户数据表 - 存储战绩、攻略等用户数据
// user_id 由浏览器生成，用于数据隔离
export const userData = pgTable(
  "user_data",
  {
    id: serial().primaryKey(),
    user_id: varchar("user_id", { length: 64 }).notNull(),
    data_type: varchar("data_type", { length: 32 }).notNull(), // match_records, match_stats, guides, profile
    data: jsonb("data").notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_data_user_id_idx").on(table.user_id),
    index("user_data_user_type_idx").on(table.user_id, table.data_type),
  ]
);
