import bcrypt from "bcryptjs";
import mongoose, { type InferSchemaType, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    tokenVersion: { type: Number, default: 0, required: true },
  },
  { timestamps: true },
);

userSchema.methods.comparePassword = async function comparePassword(
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
  comparePassword(candidate: string): Promise<boolean>;
};

export const User = mongoose.model<UserDocument>("User", userSchema);

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function toPublicUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
