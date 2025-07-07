const z = require("zod");
const userSchema = z.object({
  user: z.object({
    username: z.string().min(3).max(30),
    firstName: z.string().min(3).max(30),
    lastName: z.string().min(3).max(30),
    password: z
      .string()
      .min(8)
      .max(30)
      .regex(/^[a-zA-Z0-9_]*$/),
  }),
});

const infoSchema = z.object({
  info: z.object({
    toUser: z.string().min(3).max(30),
    amount: z.string().min(1).max(100000),
  }),
});

module.exports = { userSchema, infoSchema };
