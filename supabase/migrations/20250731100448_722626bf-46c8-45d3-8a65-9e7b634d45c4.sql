-- Add DELETE policy for scans table
CREATE POLICY "Users can delete their own scans" 
ON public.scans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime for scans table
ALTER TABLE public.scans REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scans;

-- Enable realtime for scan_results table  
ALTER TABLE public.scan_results REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scan_results;