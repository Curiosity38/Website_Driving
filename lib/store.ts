import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Booking } from "./types";

const dataDir = path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "bookings.json");

export async function listBookings() {
  return readBookings();
}

export async function createBooking(
  booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
) {
  const now = new Date().toISOString();
  const next: Booking = {
    ...booking,
    id: createBookingId(),
    createdAt: now,
    updatedAt: now
  };
  const bookings = await readBookings();
  bookings.unshift(next);
  await writeBookings(bookings);
  return next;
}

export async function getBooking(id: string) {
  const bookings = await readBookings();
  return bookings.find((booking) => booking.id === id) ?? null;
}

export async function updateBooking(
  id: string,
  updater: (booking: Booking) => Booking
) {
  const bookings = await readBookings();
  const index = bookings.findIndex((booking) => booking.id === id);
  if (index === -1) {
    return null;
  }
  const updated = {
    ...updater(bookings[index]),
    updatedAt: new Date().toISOString()
  };
  bookings[index] = updated;
  await writeBookings(bookings);
  return updated;
}

export async function updateBookingByOutTradeNo(
  outTradeNo: string,
  updater: (booking: Booking) => Booking
) {
  const bookings = await readBookings();
  const index = bookings.findIndex(
    (booking) => booking.payment?.outTradeNo === outTradeNo
  );
  if (index === -1) {
    return null;
  }
  const updated = {
    ...updater(bookings[index]),
    updatedAt: new Date().toISOString()
  };
  bookings[index] = updated;
  await writeBookings(bookings);
  return updated;
}

async function readBookings(): Promise<Booking[]> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeBookings(bookings: Booking[]) {
  await mkdir(dataDir, { recursive: true });
  const tempFile = `${dataFile}.tmp`;
  await writeFile(tempFile, JSON.stringify(bookings, null, 2), "utf8");
  await rename(tempFile, dataFile);
}

function createBookingId() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BK${stamp}${random}`;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
