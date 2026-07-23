import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";
import type { ProfileUpdateInput, AddressInput } from "@/lib/validation/profile";

export interface AddressData extends AddressInput {
  _id: string;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  age?: number;
  phone?: string;
  addresses: AddressData[];
}

function serialize(user: {
  _id: unknown;
  name: string;
  email: string;
  age?: number;
  phone?: string;
  addresses: { toObject: () => AddressInput & { _id: unknown } }[];
}): ProfileData {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    age: user.age,
    phone: user.phone,
    addresses: user.addresses.map((address) => {
      const { _id, ...rest } = address.toObject();
      return { _id: String(_id), ...rest };
    }),
  };
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) return null;
  return serialize(user);
}

export async function updateProfile(userId: string, data: ProfileUpdateInput): Promise<ProfileData | null> {
  await connectToDatabase();
  const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });
  if (!user) return null;
  return serialize(user);
}

export async function addAddress(userId: string, data: AddressInput): Promise<ProfileData | null> {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) return null;

  if (data.isDefault) {
    user.addresses.forEach((address) => {
      address.isDefault = false;
    });
  }
  user.addresses.push(data);
  await user.save();
  return serialize(user);
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: AddressInput,
): Promise<ProfileData | null> {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) return null;

  const address = user.addresses.id(addressId);
  if (!address) return null;

  if (data.isDefault) {
    user.addresses.forEach((entry) => {
      entry.isDefault = false;
    });
  }
  address.set(data);
  await user.save();
  return serialize(user);
}

export async function deleteAddress(userId: string, addressId: string): Promise<ProfileData | null> {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) return null;

  user.addresses.pull({ _id: addressId });
  await user.save();
  return serialize(user);
}
