import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

interface AISummaryBoxProps {
  reportData: any;
  reportType: 'sales' | 'inventory' | 'staff';
}

const AISummaryBox: React.FC<AISummaryBoxProps> = ({ reportData, reportType }) => {
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const handleGenerateSummary = async (language: 'de' | 'en') => {
    if (!reportData) return;
    setIsGeneratingSummary(true);
    setAiSummary('');
    try {
      const { data, error } = await supabase.functions.invoke('generate-report-insights', {
        body: { reportData, language, reportType },
      });
      if (error) throw error;
      setAiSummary(data.summary);
    } catch (err: any) {
      toast({ title: `AI Summary Error (${reportType})`, description: err.message, variant: 'destructive' });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGetInsight = async (language: 'de' | 'en') => {
    if (!userPrompt || !reportData) return;
    setIsGeneratingInsight(true);
    setAiInsight('');
    try {
      const { data, error } = await supabase.functions.invoke('generate-report-insights', {
        body: { reportData, userPrompt, language, reportType },
      });
      if (error) throw error;
      setAiInsight(data.summary);
    } catch (err: any) {
      toast({ title: `AI Insight Error (${reportType})`, description: err.message, variant: 'destructive' });
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            KI-Zusammenfassung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={() => handleGenerateSummary('de')} disabled={isGeneratingSummary} className="w-full">
              {isGeneratingSummary ? 'Wird generiert...' : 'Zusammenfassung (DE)'}
            </Button>
            <Button onClick={() => handleGenerateSummary('en')} disabled={isGeneratingSummary} variant="outline" className="w-full">
              {isGeneratingSummary ? 'Generating...' : 'Summary (EN)'}
            </Button>
          </div>
          {isGeneratingSummary && <Skeleton className="h-20 w-full" />}
          {!isGeneratingSummary && aiSummary && <p className="text-sm text-muted-foreground">{aiSummary}</p>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Fragen Sie die KI</CardTitle></CardHeader>
        <CardContent>
           <div className="flex flex-col gap-2">
              <Textarea placeholder="Stellen Sie eine Frage zu diesem Bericht..." value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)} className="mb-2" />
             <div className="flex gap-2">
                <Button onClick={() => handleGetInsight('de')} disabled={isGeneratingInsight} className="w-full">
                  {isGeneratingInsight ? 'Denken...' : 'Fragen (DE)'}
                </Button>
                <Button onClick={() => handleGetInsight('en')} disabled={isGeneratingInsight} variant="outline" className="w-full">
                  {isGeneratingInsight ? 'Thinking...' : 'Ask (EN)'}
                </Button>
             </div>
           </div>
           {isGeneratingInsight && <Skeleton className="h-20 w-full mt-4" />}
           {!isGeneratingInsight && aiInsight && <p className="text-sm text-muted-foreground mt-4">{aiInsight}</p>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AISummaryBox; 