import {
  OpenAIResponsesRefusalContent$inboundSchema,
  ReasoningSummaryText$inboundSchema,
  ResponseOutputText$inboundSchema,
} from "@openrouter/sdk/esm/models";
import z from "zod";

export const MessageStatusSchema = z.enum([
  "completed",
  "incomplete",
  "in_progress",
]);

export type MessageStatus = z.infer<typeof MessageStatusSchema>;

export const MessageSchema = z.object({
  type: z.literal("message"),
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  status: MessageStatusSchema.optional(),
  content: z.array(
    z.union([
      ResponseOutputText$inboundSchema,
      OpenAIResponsesRefusalContent$inboundSchema,
    ]),
  ),
});

export const FunctionCallSchema = z.object({
  type: z.literal("function_call"),
  id: z.string(),
  callId: z.string(),
  name: z.string(),
  arguments: z.string(),
  status: MessageStatusSchema.optional(),
});

export const ReasoningSchema = z.object({
  type: z.literal("reasoning"),
  id: z.string(),
  summary: z.array(ReasoningSummaryText$inboundSchema),
  status: MessageStatusSchema.optional(),
});

export const FunctionCallOutputSchema = z.object({
  type: z.literal("function_call_output"),
  id: z.string().nullish(),
  callId: z.string(),
  output: z.string(),
  status: MessageStatusSchema.nullish(),
});

export const MessageUnionSchema = z.union([
  MessageSchema,
  FunctionCallSchema,
  ReasoningSchema,
  FunctionCallOutputSchema,
]);

export type MessageItem = z.infer<typeof MessageUnionSchema>;
export type MessageMessage = z.infer<typeof MessageSchema>;
export type FunctionCallMessage = z.infer<typeof FunctionCallSchema>;
export type ReasoningMessage = z.infer<typeof ReasoningSchema>;
export type FunctionCallOutputMessage = z.infer<
  typeof FunctionCallOutputSchema
>;
