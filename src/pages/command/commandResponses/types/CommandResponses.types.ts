export interface CommandReply {
  id: number
  command_log_id: number
  reply_data: any[] | null
  created_at: string | null
  updated_at: string | null
}