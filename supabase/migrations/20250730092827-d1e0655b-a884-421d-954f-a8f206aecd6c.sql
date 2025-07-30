-- Create scans table to track all security scans
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target TEXT NOT NULL,
  scan_type TEXT NOT NULL, -- domain, port, vulnerability, ssl
  scan_subtype TEXT, -- tcp, udp, stealth, web, network, etc.
  status TEXT NOT NULL DEFAULT 'queued', -- queued, running, completed, failed
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  progress INTEGER DEFAULT 0,
  findings_count INTEGER DEFAULT 0,
  severity TEXT DEFAULT 'none', -- none, low, medium, high, critical
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scan_results table to store detailed scan output
CREATE TABLE public.scan_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  result_type TEXT NOT NULL, -- raw_output, formatted_summary, findings
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- Create policies for scans table
CREATE POLICY "Users can view their own scans" 
ON public.scans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans" 
ON public.scans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans" 
ON public.scans 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for scan_results table
CREATE POLICY "Users can view their own scan results" 
ON public.scan_results 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.scans WHERE scans.id = scan_results.scan_id));

CREATE POLICY "Edge functions can insert scan results" 
ON public.scan_results 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Edge functions can update scan results" 
ON public.scan_results 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_scans_updated_at
BEFORE UPDATE ON public.scans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_status ON public.scans(status);
CREATE INDEX idx_scans_created_at ON public.scans(created_at);
CREATE INDEX idx_scan_results_scan_id ON public.scan_results(scan_id);