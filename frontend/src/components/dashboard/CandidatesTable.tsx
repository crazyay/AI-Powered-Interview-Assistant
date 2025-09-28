'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  Eye, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar,
  Filter,
  Users
} from 'lucide-react';
import { formatDate, getScoreBadgeClass } from '@/lib/utils';
import { Candidate } from '@/types';

interface CandidatesTableProps {
  candidates: Candidate[];
  loading: boolean;
  onSearch: (query: string) => void;
  onSort: (field: string, order: 'asc' | 'desc') => void;
  onDelete: (candidateId: string) => void;
  onView: (candidateId: string) => void;
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({
  candidates,
  loading,
  onSearch,
  onSort,
  onDelete,
  onView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('totalScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSort = (field: string) => {
    const newOrder = sortField === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortField(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <Filter className="w-4 h-4 text-gray-400" />;
    return sortOrder === 'desc' 
      ? <SortDesc className="w-4 h-4 text-blue-600" />
      : <SortAsc className="w-4 h-4 text-blue-600" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>Loading candidates...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Candidates ({candidates.length})</CardTitle>
            <CardDescription>Manage and review candidate interviews</CardDescription>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>
      </CardHeader>
      
      <CardContent>
        {candidates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'No interviews have been completed yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold"
                    >
                      Candidate {getSortIcon('name')}
                    </Button>
                  </th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('totalScore')}
                      className="h-auto p-0 font-semibold"
                    >
                      Score {getSortIcon('totalScore')}
                    </Button>
                  </th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleSort('lastInterview')}
                      className="h-auto p-0 font-semibold"
                    >
                      Interview Date {getSortIcon('lastInterview')}
                    </Button>
                  </th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{candidate.name}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          {candidate.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-3 h-3 mr-1" />
                          {candidate.phone}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      {candidate.totalScore !== null && candidate.totalScore !== undefined ? (
                        <Badge className={getScoreBadgeClass(candidate.totalScore)}>
                          {candidate.totalScore}%
                        </Badge>
                      ) : (
                        <span className="text-gray-400">Not completed</span>
                      )}
                    </td>
                    
                    <td className="p-4">
                      <Badge 
                        variant={
                          candidate.status === 'completed' ? 'success' : 
                          candidate.status === 'in-progress' ? 'warning' : 'secondary'
                        }
                      >
                        {candidate.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(candidate.lastInterview)}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(candidate._id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(candidate._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};