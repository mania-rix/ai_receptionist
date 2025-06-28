'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Upload, QrCode, Share2, Verify, User, Mail, Phone, Building, Loader2, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';
import { createDigitalBusinessCard, verifyDigitalCard } from '@/lib/picaos';
import { recordCardAudit } from '@/lib/algorand';

interface DigitalCard {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  image_url?: string;
  ipfs_hash: string;
  qr_code_url: string;
  verification_url: string;
  created_at: string;
}

export default function DigitalCardsPage() {
  const [cards, setCards] = useState<DigitalCard[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [open, setOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<DigitalCard | null>(null);
  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    image: null as File | null,
  });

  useEffect(() => {
    console.log('[DigitalCards] Component mounted');
    loadDemoCards();
  }, []);

  const loadDemoCards = () => {
    console.log('[DigitalCards] Loading demo cards...');
    const demoCards: DigitalCard[] = [
      {
        id: 'demo_card_1',
        name: 'Dr. Sarah Johnson',
        title: 'Chief Medical Officer',
        company: 'BlvckWall Medical AI',
        email: 'sarah.johnson@blvckwall.ai',
        phone: '+1 (555) 123-4567',
        image_url: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=300',
        ipfs_hash: 'QmDemo123456789SarahJohnson',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ipfs.io/ipfs/QmDemo123456789SarahJohnson',
        verification_url: 'https://picaos.com/verify/QmDemo123456789SarahJohnson',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'demo_card_2',
        name: 'Michael Chen',
        title: 'AI Solutions Architect',
        company: 'BlvckWall AI',
        email: 'michael.chen@blvckwall.ai',
        phone: '+1 (555) 987-6543',
        image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
        ipfs_hash: 'QmDemo987654321MichaelChen',
        qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://ipfs.io/ipfs/QmDemo987654321MichaelChen',
        verification_url: 'https://picaos.com/verify/QmDemo987654321MichaelChen',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    setCards(demoCards);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('[DigitalCards] Image selected:', file.name);
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const createCard = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive',
      });
      return;
    }

    console.log('[DigitalCards] Creating digital card for:', formData.name);
    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create digital business card using Picaos API
      const card = await createDigitalBusinessCard({
        name: formData.name,
        title: formData.title,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        image: formData.image || undefined,
      });

      setCards(prev => [card, ...prev]);

      // Record audit log on blockchain
      await recordCardAudit(card.id, user.id, {
        name: formData.name,
        company: formData.company,
        ipfs_hash: card.ipfs_hash
      });

      setOpen(false);
      setFormData({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        image: null,
      });

      console.log('[DigitalCards] Digital card created:', card.id);
      toast({
        title: 'Card Created',
        description: `Digital business card for ${formData.name} has been minted to IPFS`,
      });
    } catch (error) {
      console.error('[DigitalCards] Error creating card:', error);
      toast({
        title: 'Error',
        description: 'Failed to create digital card',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const verifyCard = async () => {
    if (!verifyHash.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an IPFS hash to verify',
        variant: 'destructive',
      });
      return;
    }

    console.log('[DigitalCards] Verifying card:', verifyHash);
    setIsVerifying(true);

    try {
      const result = await verifyDigitalCard(verifyHash);
      setVerifyResult(result);

      if (result.verified) {
        toast({
          title: 'Card Verified',
          description: 'Digital business card is authentic and verified on IPFS',
        });
      } else {
        toast({
          title: 'Verification Failed',
          description: 'Could not verify this digital business card',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[DigitalCards] Error verifying card:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify card',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const shareCard = async (card: DigitalCard) => {
    console.log('[DigitalCards] Sharing card:', card.id);
    try {
      await navigator.share({
        title: `${card.name} - Digital Business Card`,
        text: `${card.title} at ${card.company}`,
        url: card.verification_url,
      });
    } catch (error) {
      // Fallback to clipboard
      await navigator.clipboard.writeText(card.verification_url);
      toast({
        title: 'Link Copied',
        description: 'Card verification link copied to clipboard',
      });
    }
  };

  const downloadQR = (card: DigitalCard) => {
    console.log('[DigitalCards] Downloading QR code for:', card.id);
    const link = document.createElement('a');
    link.href = card.qr_code_url;
    link.download = `qr-code-${card.name.replace(/\s+/g, '-')}.png`;
    link.click();
  };

  const previewCard = (card: DigitalCard) => {
    console.log('[DigitalCards] Previewing card:', card.id);
    setSelectedCard(card);
    setPreviewOpen(true);
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Business Card Vault</h1>
          <p className="text-gray-400 mt-1">Create and verify blockchain-secured business cards with Picaos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Verify className="mr-2 h-4 w-4" />
                Verify Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Verify Digital Business Card</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">IPFS Hash</label>
                  <Input
                    placeholder="Enter IPFS hash (e.g., QmX...)"
                    value={verifyHash}
                    onChange={(e) => setVerifyHash(e.target.value)}
                  />
                </div>

                {verifyResult && (
                  <div className={`p-4 rounded-lg border ${
                    verifyResult.verified 
                      ? 'bg-green-950/20 border-green-500/20' 
                      : 'bg-red-950/20 border-red-500/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Verify className={`h-4 w-4 ${verifyResult.verified ? 'text-green-400' : 'text-red-400'}`} />
                      <span className={`font-medium ${verifyResult.verified ? 'text-green-400' : 'text-red-400'}`}>
                        {verifyResult.verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                    {verifyResult.verified && verifyResult.card && (
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {verifyResult.card.name}</p>
                        <p><strong>Company:</strong> {verifyResult.card.company}</p>
                        <p><strong>Email:</strong> {verifyResult.card.email}</p>
                      </div>
                    )}
                  </div>
                )}

                <Button 
                  onClick={verifyCard} 
                  disabled={isVerifying || !verifyHash.trim()}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Verify className="mr-2 h-4 w-4" />
                      Verify on IPFS
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Create Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Digital Business Card</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Full Name *</label>
                    <Input
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Job Title</label>
                    <Input
                      placeholder="e.g., AI Specialist"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Company</label>
                  <Input
                    placeholder="Company name"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Email *</label>
                    <Input
                      type="email"
                      placeholder="email@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Phone</label>
                    <Input
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Profile Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    {formData.image && (
                      <span className="text-sm text-gray-400">{formData.image.name}</span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="bg-purple-950/20 border border-purple-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">IPFS Storage</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Your business card will be stored on IPFS for permanent, decentralized access and verification.
                  </p>
                </div>

                <Button 
                  onClick={createCard} 
                  disabled={isCreating || !formData.name || !formData.email}
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting to IPFS...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Create Digital Card
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group"
          >
            <Card className="border-gray-800 bg-[#121212] hover:bg-gray-900/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{card.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    IPFS
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {card.image_url ? (
                    <img 
                      src={card.image_url} 
                      alt={card.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{card.title}</p>
                    <p className="text-sm text-gray-400 truncate">{card.company}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{card.email}</span>
                  </div>
                  {card.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{card.phone}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">IPFS Hash</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(card.ipfs_hash)}
                      className="h-6 px-2"
                    >
                      Copy
                    </Button>
                  </div>
                  <code className="text-xs font-mono text-gray-300 break-all">
                    {card.ipfs_hash}
                  </code>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => previewCard(card)}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    Preview
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => shareCard(card)}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => downloadQR(card)}
                  >
                    <QrCode className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {cards.length === 0 && (
        <Card className="border-gray-800 bg-[#121212]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No digital cards yet</h3>
            <p className="text-gray-400 text-center mb-4">
              Create your first blockchain-secured digital business card
            </p>
            <Button onClick={() => setOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Create First Card
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Card Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Digital Business Card</DialogTitle>
          </DialogHeader>
          {selectedCard && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center gap-4 mb-4">
                  {selectedCard.image_url ? (
                    <img 
                      src={selectedCard.image_url} 
                      alt={selectedCard.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{selectedCard.name}</h3>
                    <p className="text-purple-100">{selectedCard.title}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{selectedCard.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{selectedCard.email}</span>
                  </div>
                  {selectedCard.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{selectedCard.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <img 
                  src={selectedCard.qr_code_url} 
                  alt="QR Code"
                  className="w-32 h-32 mx-auto mb-2"
                />
                <p className="text-xs text-gray-400">Scan to verify on IPFS</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}