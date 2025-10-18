# E-Signature Integration Components

This directory contains comprehensive e-signature integration components for the OpsCrew platform, providing a complete solution for managing electronic signatures in proposals and contracts.

## Components Overview

### Core Components

#### 1. `EsignatureIntegration.tsx`
The main integration component that provides a complete e-signature workflow interface.

**Features:**
- Multi-tab interface (Overview, Signers, Analytics, Settings)
- Real-time status tracking
- Signer management
- Provider configuration
- Action buttons (Send, Void, Download)

**Usage:**
```tsx
import { EsignatureIntegration } from '@/components/proposals/EsignatureIntegration'

<EsignatureIntegration 
  proposal={proposal} 
  onStatusChange={handleStatusChange}
/>
```

#### 2. `SignatureStatusTracker.tsx`
Real-time tracking component for signature status with detailed timeline.

**Features:**
- Live status updates
- Signature timeline
- Progress tracking
- Individual signature details
- Action buttons for each signature

**Usage:**
```tsx
import { SignatureStatusTracker } from '@/components/proposals/SignatureStatusTracker'

<SignatureStatusTracker 
  signatures={signatures}
  onRefresh={handleRefresh}
  onViewDocument={handleViewDocument}
  onDownloadDocument={handleDownloadDocument}
  onResendReminder={handleResendReminder}
/>
```

#### 3. `EsignatureAnalytics.tsx`
Comprehensive analytics dashboard for signature workflows.

**Features:**
- Performance metrics
- Status distribution charts
- Daily trends
- Hourly distribution
- Provider performance
- Export functionality

**Usage:**
```tsx
import { EsignatureAnalytics } from '@/components/proposals/EsignatureAnalytics'

<EsignatureAnalytics 
  signatures={signatures}
  timeRange="30d"
  onTimeRangeChange={handleTimeRangeChange}
  onExport={handleExport}
/>
```

#### 4. `EsignatureWebhookHandler.tsx`
Real-time webhook event processing component.

**Features:**
- Webhook event display
- Event processing status
- Error handling and retry
- Event details modal
- Real-time updates

**Usage:**
```tsx
import { EsignatureWebhookHandler } from '@/components/proposals/EsignatureWebhookHandler'

<EsignatureWebhookHandler 
  proposal={proposal}
  onStatusChange={handleStatusChange}
/>
```

#### 5. `EsignatureDashboard.tsx`
Comprehensive dashboard that combines all e-signature functionality.

**Features:**
- Summary statistics
- Tabbed interface
- Search and filtering
- Export functionality
- Real-time updates

**Usage:**
```tsx
import { EsignatureDashboard } from '@/components/proposals/EsignatureDashboard'

<EsignatureDashboard 
  proposal={proposal}
  onStatusChange={handleStatusChange}
/>
```

## Services

### `esignature-providers.ts`
Unified service for managing different e-signature providers.

**Features:**
- Provider abstraction
- DocuSign integration
- Error handling
- Configuration management
- Webhook processing

**Usage:**
```tsx
import { getEsignatureProviderService } from '@/services/esignature-providers'

const service = getEsignatureProviderService()
const result = await service.createEnvelope(config)
```

## Hooks

### `useProposalSignatures.ts`
React Query hooks for managing proposal signatures.

**Features:**
- CRUD operations
- Real-time updates
- Error handling
- Optimistic updates

**Usage:**
```tsx
import { useProposalSignatures } from '@/hooks/useProposalSignatures'

const { data: signatures, isLoading } = useProposalSignatures(proposalId)
```

## Design System

### Color Palette
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)
- **Muted**: Gray (#6b7280)

### Typography
- **Font Family**: Inter
- **Headings**: 600-700 weight
- **Body**: 400-500 weight

### Spacing
- **Card Padding**: 24px
- **Section Spacing**: 24px
- **Element Spacing**: 16px

### Animations
- **Page Transitions**: Fade + slide
- **Hover Effects**: Scale (1.02-1.05)
- **Loading States**: Spinner animations
- **Stagger Animations**: 0.1s delay per item

## Features

### Core Functionality
- ✅ Multi-provider support (DocuSign, HelloSign, Adobe Sign)
- ✅ Real-time status tracking
- ✅ Webhook event processing
- ✅ Comprehensive analytics
- ✅ Error handling and retry
- ✅ Mobile-responsive design
- ✅ Dark mode support
- ✅ TypeScript support

### Advanced Features
- ✅ Signature timeline
- ✅ Performance metrics
- ✅ Export functionality
- ✅ Search and filtering
- ✅ Audit trail
- ✅ Provider management
- ✅ Security settings

## API Integration

### DocuSign
- JWT authentication
- Envelope management
- Recipient views
- Webhook processing
- Document retrieval

### Error Handling
- Network timeouts
- API rate limits
- Authentication errors
- Validation errors
- Retry mechanisms

## Usage Examples

### Basic Integration
```tsx
import { EsignatureDashboard } from '@/components/proposals/EsignatureDashboard'

function ProposalPage({ proposal }) {
  const handleStatusChange = (updatedProposal) => {
    // Handle proposal status updates
    console.log('Proposal updated:', updatedProposal)
  }

  return (
    <EsignatureDashboard 
      proposal={proposal}
      onStatusChange={handleStatusChange}
    />
  )
}
```

### Custom Analytics
```tsx
import { EsignatureAnalytics } from '@/components/proposals/EsignatureAnalytics'

function AnalyticsPage({ signatures }) {
  const handleExport = () => {
    // Export analytics data
    console.log('Exporting analytics...')
  }

  return (
    <EsignatureAnalytics 
      signatures={signatures}
      timeRange="30d"
      onExport={handleExport}
    />
  )
}
```

### Webhook Processing
```tsx
import { EsignatureWebhookHandler } from '@/components/proposals/EsignatureWebhookHandler'

function WebhookPage({ proposal }) {
  return (
    <EsignatureWebhookHandler 
      proposal={proposal}
      onStatusChange={handleStatusChange}
    />
  )
}
```

## Configuration

### Environment Variables
```env
VITE_DOCUSIGN_BASE_URL=https://demo.docusign.net
VITE_DOCUSIGN_INTEGRATOR_KEY=your_integrator_key
VITE_DOCUSIGN_USER_ID=your_user_id
VITE_DOCUSIGN_PRIVATE_KEY=your_private_key
```

### Provider Configuration
```tsx
const config = {
  provider: 'docusign',
  documentTitle: 'Contract Agreement',
  documentContent: '<html>...</html>',
  signers: [
    { name: 'John Doe', email: 'john@example.com', role: 'client' }
  ],
  settings: {
    reminderFrequency: 3,
    expirationDays: 30,
    requireAuthentication: true,
    allowDecline: true,
    emailNotifications: true
  }
}
```

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern=esignature
```

### Integration Tests
```bash
npm test -- --testPathPattern=integration
```

### E2E Tests
```bash
npm run test:e2e -- --spec="esignature.spec.ts"
```

## Performance

### Optimization
- React Query for caching
- Lazy loading for charts
- Debounced search
- Optimistic updates
- Memoized components

### Bundle Size
- Tree-shaking enabled
- Dynamic imports
- Code splitting
- Minimal dependencies

## Security

### Data Protection
- JWT token management
- Secure API calls
- Input validation
- XSS protection
- CSRF protection

### Privacy
- No sensitive data in logs
- Encrypted storage
- Secure transmission
- GDPR compliance

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Support

- iOS Safari 14+
- Android Chrome 90+
- Responsive design
- Touch-friendly interface

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators

## Contributing

1. Follow the existing code style
2. Add TypeScript types
3. Include unit tests
4. Update documentation
5. Test in multiple browsers

## License

This code is part of the OpsCrew platform and is proprietary software.