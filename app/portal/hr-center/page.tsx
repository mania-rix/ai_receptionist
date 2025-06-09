'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, User, CheckCircle, XCircle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-browser';

export default function HRCenterPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchHRRequests();
  }, []);

  const fetchHRRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('hr_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching HR requests:', error);
    }
  };

  const updateRequestStatus = async (id: string, status: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('hr_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status } : req
      ));

      toast({
        title: 'Success',
        description: `Request ${status}`,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Employee', 'Phone', 'Type', 'Reason', 'Status'].join(','),
      ...requests.map(req => [
        format(new Date(req.created_at), 'yyyy-MM-dd'),
        req.employee_name || 'Unknown',
        req.employee_phone,
        req.request_type,
        `"${req.reason || ''}"`,
        req.status,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hr-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'denied': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'denied': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">HR Center</h1>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {requests.filter(r => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#121212]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {requests.filter(r => r.status === 'denied').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Time-Off Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border border-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(request.status)}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {request.employee_name || 'Unknown Employee'}
                      </span>
                      <span className="text-sm text-gray-400">
                        {request.employee_phone}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {request.request_type} • {format(new Date(request.created_at), 'PPp')}
                    </div>
                    {request.reason && (
                      <div className="text-sm mt-2 p-2 bg-gray-900 rounded">
                        "{request.reason}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getStatusIcon(request.status)}
                    {request.status}
                  </Badge>
                  
                  {request.call_recording_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={request.call_recording_url} target="_blank" rel="noopener noreferrer">
                        Play Recording
                      </a>
                    </Button>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-500 border-green-500"
                        onClick={() => updateRequestStatus(request.id, 'approved')}
                        disabled={isLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-500"
                        onClick={() => updateRequestStatus(request.id, 'denied')}
                        disabled={isLoading}
                      >
                        Deny
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {requests.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No HR requests yet. Employees can call the HR line to submit requests.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* HR Policy Settings */}
      <Card className="border-gray-800 bg-[#121212]">
        <CardHeader>
          <CardTitle>Policy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Auto-approve sick days under</label>
                <p className="text-sm text-gray-400">Automatically approve sick day requests under this duration</p>
              </div>
              <Select defaultValue="3">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="2">2 days</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="5">5 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Require manager approval for</label>
                <p className="text-sm text-gray-400">Request types that need manager approval</p>
              </div>
              <Select defaultValue="vacation">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">Vacation only</SelectItem>
                  <SelectItem value="all">All requests</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}