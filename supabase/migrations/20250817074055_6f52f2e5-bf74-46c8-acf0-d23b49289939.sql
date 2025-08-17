-- Nettoyer complètement les policies RLS pour les messages
DROP POLICY IF EXISTS "messages_insert_own" ON messages;
DROP POLICY IF EXISTS "messages_select_own" ON messages;
DROP POLICY IF EXISTS "messages_update_own" ON messages;

-- Supprimer toutes les autres policies
DROP POLICY IF EXISTS "Users can insert messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their matches" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can view match messages" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their matches" ON messages;
DROP POLICY IF EXISTS "msg_insert_own" ON messages;
DROP POLICY IF EXISTS "msg_select_participants" ON messages;
DROP POLICY IF EXISTS "msg_update_participants" ON messages;

-- Recréer des policies simples
CREATE POLICY "messages_basic_insert" ON messages
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_basic_select" ON messages
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "messages_basic_update" ON messages
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );