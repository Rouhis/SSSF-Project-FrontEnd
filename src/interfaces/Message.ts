/**
 * Interface for the Message data type.
 *
 * @interface
 * @property {string} sender - The ID of the user who sent the message.
 * @property {string} recipient - The ID of the user who is the recipient of the message.
 * @property {string} content - The content of the message.
 */
interface Message {
  sender: string;
  recipient: string;
  content: string;
}

export type {Message};
