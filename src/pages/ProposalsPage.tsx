/**
 * Proposals Page
 * Main page for managing proposals and e-signature workflow
 */

import React, { useState } from 'react'
import { motion } from 'motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  FileText, 
  Send, 
  CheckCircle, 
  Clock,
  ArrowLeft
} from 'lucide-react'
import { ProposalEditor } from '@/components/proposals/ProposalEditor'
import { ProposalList } from '@/components/proposals/ProposalList'
import { EsignatureFlow } from '@/components/proposals/EsignatureFlow'
import { useCreateProposal } from '@/hooks/useProposals'
import type { Proposal } from '@/types/database/proposals'

interface ProposalsPageProps {
  userId: string
}

export function ProposalsPage({ userId }: ProposalsPageProps) {
  const createProposal = useCreateProposal()
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  const handleCreateProposal = async () => {
    try {
      const newProposal = await createProposal.mutateAsync({
        user_id: userId,
        title: 'New Proposal',
        client_name: 'Client Name',
        content: 'Enter your proposal content here...',
        status: 'draft'
      })
      
      setSelectedProposal(newProposal)
      setActiveTab('editor')
    } catch (error) {
      console.error('Failed to create proposal:', error)
    }
  }

  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setActiveTab('editor')
  }

  const handleBackToList = () => {
    setSelectedProposal(null)
    setActiveTab('list')
  }

  const handleProposalSave = (proposal: Proposal) => {
    setSelectedProposal(proposal)
  }

  const handleProposalSend = (proposal: Proposal) => {
    setSelectedProposal(proposal)
    setActiveTab('esignature')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
              <p className="text-gray-600 mt-1">
                Create, manage, and track proposal e-signatures
              </p>
            </div>
            
            {activeTab === 'list' && (
              <Button onClick={handleCreateProposal} disabled={createProposal.isPending}>
                <Plus className="h-4 w-4 mr-2" />
                {createProposal.isPending ? 'Creating...' : 'New Proposal'}
              </Button>
            )}
            
            {activeTab !== 'list' && (
              <Button variant="outline" onClick={handleBackToList}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">All Proposals</TabsTrigger>
            <TabsTrigger value="editor" disabled={!selectedProposal}>
              {selectedProposal ? 'Edit Proposal' : 'Edit Proposal'}
            </TabsTrigger>
            <TabsTrigger value="esignature" disabled={!selectedProposal}>
              E-Signature
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <ProposalList
              userId={userId}
              onSelectProposal={handleSelectProposal}
              onCreateProposal={handleCreateProposal}
            />
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            {selectedProposal ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProposalEditor
                  proposalId={selectedProposal.id}
                  onSave={handleProposalSave}
                  onSend={handleProposalSend}
                />
              </motion.div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No proposal selected</h3>
                  <p className="text-gray-600 mb-4">
                    Select a proposal from the list to edit it.
                  </p>
                  <Button onClick={handleBackToList}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="esignature" className="space-y-6">
            {selectedProposal ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EsignatureFlow
                  proposal={selectedProposal}
                  onStatusChange={handleProposalSave}
                />
              </motion.div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Send className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No proposal selected</h3>
                  <p className="text-gray-600 mb-4">
                    Select a proposal from the list to manage its e-signature.
                  </p>
                  <Button onClick={handleBackToList}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        {activeTab === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Proposals</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Signed</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Send className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Sent</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
