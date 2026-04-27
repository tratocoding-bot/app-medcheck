-- Allow users to delete their own answers for reset functionality
CREATE POLICY "Users can delete their own answers"
ON public.user_answers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);