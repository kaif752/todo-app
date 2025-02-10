import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar, Flag, Tag } from "lucide-react";
import { insertTodoSchema, type Todo, PriorityLevel, DEFAULT_CATEGORIES } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

function getPriorityColor(priority: string) {
  switch (priority) {
    case PriorityLevel.HIGH:
      return "text-rose-500 dark:text-rose-400";
    case PriorityLevel.MEDIUM:
      return "text-amber-500 dark:text-amber-400";
    case PriorityLevel.LOW:
      return "text-emerald-500 dark:text-emerald-400";
    default:
      return "";
  }
}

export default function Home() {
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(insertTodoSchema),
    defaultValues: {
      title: "",
      completed: false,
      dueDate: null,
      priority: PriorityLevel.MEDIUM,
      category: null,
    },
  });

  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { 
      title: string; 
      completed: boolean; 
      dueDate: string | null; 
      priority: string;
      category: string | null;
    }) => {
      await apiRequest("POST", "/api/todos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      form.reset();
      toast({
        title: "Success",
        description: "Todo added successfully",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/todos/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    // Convert "none" category to null before submitting
    const submissionData = {
      ...data,
      category: data.category === "none" ? null : data.category,
    };
    createMutation.mutate(submissionData);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-2xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Todo List
            </h1>
            <p className="text-muted-foreground">
              Keep track of your tasks and stay organized.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Add a new todo..."
                        {...field}
                        disabled={createMutation.isPending}
                        className="h-11"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    >
                      <SelectTrigger className="w-[120px] h-11">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {DEFAULT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-[110px] h-11">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PriorityLevel.HIGH}>High</SelectItem>
                        <SelectItem value={PriorityLevel.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={PriorityLevel.LOW}>Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn(
                            "w-11 h-11",
                            field.value && "text-primary"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) =>
                            field.onChange(date ? date.toISOString() : null)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-11"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </form>
        </Form>

        <div className="space-y-4">
          {todos.map((todo) => (
            <Card
              key={todo.id}
              className={cn(
                "p-4 transition-all hover:shadow-md",
                todo.completed && "opacity-80"
              )}
            >
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({
                      id: todo.id,
                      completed: checked as boolean,
                    })
                  }
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-medium",
                        todo.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {todo.title}
                    </span>
                    <Flag className={cn("h-4 w-4", getPriorityColor(todo.priority))} />
                    {todo.category && (
                      <Badge variant="secondary" className="flex gap-1 items-center">
                        <Tag className="h-3 w-3" />
                        {todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
                      </Badge>
                    )}
                  </div>
                  {todo.dueDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(todo.dueDate), "PPP")}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(todo.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          {todos.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-2">📝</div>
              No todos yet. Add one above!
            </div>
          )}
        </div>

        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteId) {
                    deleteMutation.mutate(deleteId);
                    setDeleteId(null);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}