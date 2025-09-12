'use client';

import { useState } from 'react';
import { Brain, MessageCircle, TrendingUp, Music, Eye, Dna, Star, ShoppingCart, Wand2 } from 'lucide-react';

interface DatasetCardProps {
  id: number;
  title: string;
  description: string;
  category: string;
  price: string;
  score: number;
  owner: string;
  onBuy: () => void;
  onViewMetadata: () => void;
  onAiSummarize: () => Promise<string> | void;
}

const categoryIcons = {
  'Machine Learning': Brain,
  'NLP': MessageCircle,
  'Financial': TrendingUp,
  'Audio': Music,
  'Computer Vision': Eye,
  'Bioinformatics': Dna,
};

export default function DatasetCard({
  id,
  title,
  description,
  category,
  price,
  score,
  owner,
  onBuy,
  onViewMetadata,
  onAiSummarize
}: DatasetCardProps) {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Brain;

  const handleAiSummarize = async () => {
    if (aiSummary) {
      setShowSummary(!showSummary);
      return;
    }

    setLoadingSummary(true);
    try {
      const result = await onAiSummarize();
      if (typeof result === 'string') {
        setAiSummary(result);
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Failed to get AI summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 dataset-card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CategoryIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">{category}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{score}</span>
        </div>
      </div>
      
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold text-primary">
          {price} IMT
        </div>
        <div className="text-xs text-muted-foreground">
          Owner: {owner}
        </div>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={onBuy}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Buy Access</span>
        </button>
        
        <button 
          onClick={onViewMetadata}
          className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          title="View Metadata"
        >
          <Eye className="w-4 h-4" />
        </button>
        
        <button 
          onClick={handleAiSummarize}
          className="px-4 py-2 bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors"
          title="AI Summarize"
          disabled={loadingSummary}
        >
          <Wand2 className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* AI Summary */}
      {showSummary && aiSummary && (
        <div className="bg-muted/30 p-3 rounded-lg text-sm">
          <div className="flex items-center mb-2">
            <Wand2 className="text-accent mr-2 w-4 h-4" />
            <span className="font-medium">AI Summary</span>
          </div>
          <p className="text-muted-foreground">{aiSummary}</p>
        </div>
      )}
    </div>
  );
}
