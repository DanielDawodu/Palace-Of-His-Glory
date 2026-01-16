import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRegistrationSchema, type InsertRegistration } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Home, ArrowLeft, Heart } from "lucide-react";
import { Link } from "wouter";

export default function NewMember() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();

    const form = useForm<InsertRegistration>({
        resolver: zodResolver(insertRegistrationSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            email: "",
            address: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertRegistration) => {
            const res = await fetch(api.registrations.create.path, {
                method: api.registrations.create.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Submission failed");
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Welcome to the Family!",
                description: "Your registration has been submitted successfully. We will reach out to you soon.",
            });
            setLocation("/");
        },
        onError: (error) => {
            toast({
                title: "Submission Error",
                description: error instanceof Error ? error.message : "There was a problem submitting your form.",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-16">
            <div className="max-w-2xl mx-auto px-4">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-secondary mb-8 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="bg-primary p-8 text-center">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-secondary fill-secondary" />
                        </div>
                        <h1 className="font-display text-3xl font-bold text-white mb-2">I'm New Here</h1>
                        <p className="text-white/80">We're so glad you're joining us! Please tell us a little about yourself.</p>
                    </div>

                    <div className="p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold">Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter your full name" className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold">Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="0800 000 0000" className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-700 font-bold">Email Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" type="email" className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold">Physical Address</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Your current address"
                                                    className="rounded-xl border-gray-200 focus:border-primary focus:ring-primary min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full bg-primary text-white hover:bg-primary/90 rounded-xl py-6 font-bold text-lg shadow-lg shadow-primary/20"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? "Submitting..." : "Submit Registration"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
