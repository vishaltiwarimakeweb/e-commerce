import { Schema, model, models, type Document, type Model, type Types } from "mongoose";

// Thin pointer only — full message history lives in eve's own durable session
// store and is replayed from there. This just lets a signed-in user resume
// their ShopWise conversation on a different device/browser.
export interface ChatSessionDocument extends Document {
  user: Types.ObjectId;
  sessionId: string;
  continuationToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<ChatSessionDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    sessionId: { type: String, required: true },
    continuationToken: { type: String, required: true },
  },
  { timestamps: true },
);

export const ChatSession: Model<ChatSessionDocument> =
  models.ChatSession ?? model<ChatSessionDocument>("ChatSession", chatSessionSchema);
