import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { PurchaseRequisition } from '../../types/dashboard.types';

interface PRTableProps {
  prs: PurchaseRequisition[];
  onViewDetails: (prNumber: string) => void;
}

export function PRTable({ prs, onViewDetails }: PRTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>PR Number</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Line Items</TableHead>
          <TableHead>Plant</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              No purchase requisitions found
            </TableCell>
          </TableRow>
        ) : (
          prs.map((pr) => (
            <TableRow key={pr.prNumber}>
              <TableCell className="font-medium">{pr.prNumber}</TableCell>
              <TableCell>{pr.description}</TableCell>
              <TableCell>{pr.lineItems}</TableCell>
              <TableCell>{pr.plant}</TableCell>
              <TableCell>
                <Badge variant={pr.type === 'Technical' ? 'tech' : 'comm'}>
                  {pr.type === 'Technical' ? 'TECH' : 'COMM'}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => onViewDetails(pr.prNumber)}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
