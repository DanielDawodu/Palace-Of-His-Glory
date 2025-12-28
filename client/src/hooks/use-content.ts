import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import type { 
  InsertEvent, InsertProgramme, InsertStaff, InsertDepartment, InsertComment 
} from "@shared/schema";

// --- EVENTS ---
export function useEvents() {
  return useQuery({
    queryKey: [api.events.list.path],
    queryFn: async () => {
      const res = await fetch(api.events.list.path);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      return api.events.list.responses[200].parse(data);
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEvent) => {
      // JSON dates need special handling if not using superjson, but standard JSON.stringify handles Date -> ISO string
      const res = await fetch(api.events.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.events.list.path] }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.events.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.events.list.path] }),
  });
}

// --- PROGRAMMES ---
export function useProgrammes() {
  return useQuery({
    queryKey: [api.programmes.list.path],
    queryFn: async () => {
      const res = await fetch(api.programmes.list.path);
      if (!res.ok) throw new Error("Failed to fetch programmes");
      const data = await res.json();
      return api.programmes.list.responses[200].parse(data);
    },
  });
}

export function useCreateProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProgramme) => {
      const res = await fetch(api.programmes.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create programme");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.programmes.list.path] }),
  });
}

export function useDeleteProgramme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.programmes.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete programme");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.programmes.list.path] }),
  });
}

// --- STAFF ---
export function useStaff() {
  return useQuery({
    queryKey: [api.staff.list.path],
    queryFn: async () => {
      const res = await fetch(api.staff.list.path);
      if (!res.ok) throw new Error("Failed to fetch staff");
      const data = await res.json();
      return api.staff.list.responses[200].parse(data);
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertStaff) => {
      const res = await fetch(api.staff.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create staff");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.staff.list.path] }),
  });
}

// --- DEPARTMENTS ---
export function useDepartments() {
  return useQuery({
    queryKey: [api.departments.list.path],
    queryFn: async () => {
      const res = await fetch(api.departments.list.path);
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      return api.departments.list.responses[200].parse(data);
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDepartment) => {
      const res = await fetch(api.departments.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create department");
      return await res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.departments.list.path] }),
  });
}

// --- COMMENTS ---
export function useComments(eventId: number) {
  return useQuery({
    queryKey: [api.comments.list.path, eventId],
    queryFn: async () => {
      const url = buildUrl(api.comments.list.path, { eventId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      return api.comments.list.responses[200].parse(data);
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, ...data }: InsertComment) => {
      const url = buildUrl(api.comments.create.path, { eventId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return await res.json();
    },
    onSuccess: (_, variables) => {
      const eventId = variables.eventId;
      // Invalidate the specific event's comments
      queryClient.invalidateQueries({ 
        queryKey: [api.comments.list.path, eventId] 
      });
    },
  });
}
