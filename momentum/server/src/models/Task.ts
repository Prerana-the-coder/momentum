import mongoose, { type InferSchemaType, Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
    },
    dueDate: { type: Date, default: null },
    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

// Compound index for fast per-user queries sorted by order
taskSchema.index({ userId: 1, status: 1, order: 1 });

export type TaskDocument = InferSchemaType<typeof taskSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Task = mongoose.model<TaskDocument>("Task", taskSchema);

export function toPublicTask(task: TaskDocument) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ?? null,
    order: task.order,
    userId: task.userId.toString(),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
