import { PrismaClient, TransactionType, AccountType, InvoiceStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays, subDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@fincute.app";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Seed: demo user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo Fox",
      passwordHash,
    },
  });

  const wallet = await prisma.walletAccount.create({
    data: { name: "Main Wallet", type: AccountType.CASH, balance: 5200, userId: user.id },
  });
  const bank = await prisma.walletAccount.create({
    data: { name: "Ocean Bank", type: AccountType.BANK, balance: 18250, userId: user.id },
  });

  const salaryCat = await prisma.category.create({
    data: { name: "Salary", type: TransactionType.INCOME, color: "#B7F0D8", userId: user.id },
  });
  const foodCat = await prisma.category.create({
    data: { name: "Food", type: TransactionType.EXPENSE, color: "#FFC8DD", userId: user.id },
  });
  const transportCat = await prisma.category.create({
    data: { name: "Transport", type: TransactionType.EXPENSE, color: "#A5D8FF", userId: user.id },
  });
  const softwareCat = await prisma.category.create({
    data: { name: "Software", type: TransactionType.EXPENSE, color: "#C7B9FF", userId: user.id },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        accountId: bank.id,
        categoryId: salaryCat.id,
        type: TransactionType.INCOME,
        amount: 7500,
        date: subDays(new Date(), 5),
        note: "Monthly salary",
      },
      {
        userId: user.id,
        accountId: wallet.id,
        categoryId: foodCat.id,
        type: TransactionType.EXPENSE,
        amount: 28.5,
        date: subDays(new Date(), 1),
        note: "Boba + lunch",
      },
      {
        userId: user.id,
        accountId: wallet.id,
        categoryId: transportCat.id,
        type: TransactionType.EXPENSE,
        amount: 12.75,
        date: subDays(new Date(), 2),
        note: "Ride share",
      },
      {
        userId: user.id,
        accountId: bank.id,
        categoryId: softwareCat.id,
        type: TransactionType.EXPENSE,
        amount: 59,
        date: subDays(new Date(), 3),
        note: "SaaS tools",
      },
    ],
  });

  await prisma.budget.createMany({
    data: [
      { userId: user.id, categoryId: foodCat.id, month: new Date().getMonth() + 1, year: new Date().getFullYear(), limit: 400 },
      { userId: user.id, categoryId: transportCat.id, month: new Date().getMonth() + 1, year: new Date().getFullYear(), limit: 150 },
    ],
  });

  await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "Emergency fund",
      targetAmount: 10000,
      currentAmount: 3200,
      deadline: addDays(new Date(), 120),
    },
  });

  await prisma.debt.create({
    data: {
      userId: user.id,
      name: "Laptop installment",
      totalAmount: 1500,
      remainingAmount: 900,
      dueDate: addDays(new Date(), 60),
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      userId: user.id,
      client: "Fluffy Studio",
      amount: 1200,
      status: InvoiceStatus.UNPAID,
      dueDate: addDays(new Date(), 14),
    },
  });

  console.log("Seed complete. Demo user:", email, "invoice:", invoice.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
