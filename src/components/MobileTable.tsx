import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import React from 'react';

interface MobileTableProps {
  headers: string[];
  rows: Array<{
    id: string;
    cells: (string | React.ReactNode)[];
    actions?: React.ReactNode;
  }>;
}

export function MobileTable({ headers, rows }: MobileTableProps) {
  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row) => (
        <Card key={row.id} className="overflow-hidden">
          <CardContent className="p-4 space-y-3">
            {row.cells.map((cell, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <span className="font-medium text-sm text-muted-foreground">
                  {headers[idx]}
                </span>
                <span className="text-sm text-foreground text-right">{cell}</span>
              </div>
            ))}
            {row.actions && (
              <div className="flex gap-2 pt-2 border-t">
                {row.actions}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
