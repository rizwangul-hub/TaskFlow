import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { updateTask } from "../../features/tasks/taskSlice.js";
import Spinner from "../common/Spinner.jsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const EditTaskModal = ({ task, boardMembers, isOpen, onClose }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Reset form values when task changes or modal opens
  useEffect(() => {
    if (task) {
      reset({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        assignedTo: task.assignedTo?._id || task.assignedTo || "",
      });
    }
  }, [task, reset]);

  const onSubmit = async (data) => {
    // Validate due date (must not be in the past)
    if (data.dueDate) {
      const selectedDate = new Date(data.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        toast.error("Due date cannot be in the past!");
        return;
      }
    }

    try {
      const payload = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignedTo: data.assignedTo || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      };

      const result = await dispatch(updateTask({ id: task._id, taskData: payload }));
      if (updateTask.fulfilled.match(result)) {
        toast.success("Task updated successfully!");
        onClose();
      } else {
        toast.error(result.payload || "Failed to update task");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="card relative w-full max-w-md bg-white border border-slate-100 overflow-hidden shadow-2xl z-10"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="font-display text-lg font-bold text-slate-800">Edit Task Details</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              <svg className="h-5.5 w-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <label className="label">Task Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                {...register("title", {
                  required: "Task title is required",
                  maxLength: {
                    value: 100,
                    message: "Title cannot exceed 100 characters",
                  },
                })}
                className={`input-field ${errors.title ? "input-error" : ""}`}
              />
              {errors.title && (
                <p className="error-text">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="label">Description</label>
              <textarea
                rows={3}
                placeholder="Describe task details, goals, or sub-tasks..."
                {...register("description")}
                className="input-field resize-none"
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select {...register("status")} className="input-field">
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="label">Priority</label>
                <select {...register("priority")} className="input-field">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Due Date & Assignee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  {...register("dueDate")}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Assign Member</label>
                <select {...register("assignedTo")} className="input-field">
                  <option value="">Unassigned</option>
                  {boardMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary !w-auto py-2.5 px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary !w-auto py-2.5 px-5 text-xs flex items-center gap-1.5"
              >
                {isSubmitting && <Spinner size="sm" color="white" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditTaskModal;
