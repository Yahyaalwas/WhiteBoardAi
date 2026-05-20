"use client";
import { motion } from "framer-motion";
import { User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/lib/types";
import { cn, PRIORITY_COLORS } from "@/lib/utils";

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (!tasks?.length) return null;

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="group glass rounded-xl p-4 hover:bg-white/[0.04] transition-all"
        >
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              task.priority === "high" ? "bg-red-400" :
              task.priority === "medium" ? "bg-amber-400" : "bg-emerald-400"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium">{task.title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {task.owner && (
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <User className="w-3 h-3" />{task.owner}
                  </span>
                )}
                {task.deadline && (
                  <span className="flex items-center gap-1 text-xs text-white/30">
                    <Clock className="w-3 h-3" />{task.deadline}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.priority && (
                <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium", PRIORITY_COLORS[task.priority])}>
                  {task.priority}
                </span>
              )}
              {task.status && (
                <Badge variant={task.status === "done" ? "success" : task.status === "in-progress" ? "warning" : "secondary"}>
                  {task.status}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
