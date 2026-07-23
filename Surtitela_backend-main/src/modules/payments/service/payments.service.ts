import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type PaymentPublic = {
  id_payment: number;
  payment_date: Date;
  amount: number;
  status?: boolean | null;
  id_order?: number | null;
};

export async function getAllPayments(): Promise<PaymentPublic[]> {
  const payments = await prisma.payments.findMany();
  return payments.map((payment) => normalizarPrismaEntidad(payment) as PaymentPublic);
}

export async function createPayment(data: { payment_date: Date | string; amount: number; id_order?: number }): Promise<PaymentPublic | null> {
  try {
    const payData: any = { ...data };
    if (typeof data.payment_date === 'string') {
      payData.payment_date = new Date(data.payment_date);
    }
    const payment = await prisma.payments.create({ data: payData });
    return normalizarPrismaEntidad(payment) as PaymentPublic;
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deletePayment(id_payment: number): Promise<boolean> {
  try {
    await prisma.payments.delete({ where: { id_payment } });
    return true;
  } catch (error) {
    return false;
  }
}

