'use client';

import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail, Phone, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function SubmissionsAdmin() {
  const db = useFirestore();
  const submissionsQuery = useMemoFirebase(() => {
    return query(collection(db, 'form_submissions'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: submissions, isLoading } = useCollection(submissionsQuery);

  function handleUpdateStatus(id: string, status: string) {
    updateDocumentNonBlocking(doc(db, 'form_submissions', id), { status });
  }

  function handleDelete(id: string) {
    if (confirm('Delete this submission record?')) {
      deleteDocumentNonBlocking(doc(db, 'form_submissions', id));
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-headline font-bold">Client Inquiries</h1>
        <p className="text-muted-foreground mt-2">Manage your luxury leads and booking requests.</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Track names, rituals, and contact preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-20 text-center animate-pulse">Loading inquiries...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Ritual / Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions?.map((sub: any) => (
                  <TableRow key={sub.id} className="group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold font-headline">{sub.name}</span>
                        <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mt-1">
                          <Mail className="w-3 h-3" /> <span>{sub.email}</span>
                        </div>
                        {sub.phone && (
                          <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                            <Phone className="w-3 h-3" /> <span>{sub.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-none uppercase tracking-widest text-[9px] font-bold">
                        {sub.service}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-light text-muted-foreground italic">{sub.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-none text-[9px] uppercase font-bold tracking-[0.2em] border-none",
                        sub.status === 'New' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-[10px] uppercase font-bold">
                      {sub.createdAt ? format(new Date(sub.createdAt), 'MMM dd, HH:mm') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {sub.status === 'New' && (
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(sub.id, 'Closed')}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(sub.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!submissions || submissions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center text-muted-foreground italic">
                      No inquiries received yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Utility to handle conditional classes in this context
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
