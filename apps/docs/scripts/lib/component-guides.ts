// SPDX-License-Identifier: MIT

export interface ComponentGuide {
  usage: { import: string; example: string }
  composition?: Array<{ name: string; role: string }>
}

/** Curated consumer-facing examples and compound-component relationships. */
export const componentGuides: Record<string, ComponentGuide> = {
  accordion: {
    usage: {
      import:
        "import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from '@21stgov/commons-react'",
      example: `<Accordion defaultValue={['permits']}>
  <AccordionItem value="permits">
    <AccordionTrigger>How do I apply for a permit?</AccordionTrigger>
    <AccordionPanel>Submit the application through the resident portal.</AccordionPanel>
  </AccordionItem>
</Accordion>`,
    },
    composition: [
      { name: 'Accordion', role: 'Root that manages expanded items.' },
      { name: 'AccordionItem', role: 'One disclosure item with a stable value.' },
      { name: 'AccordionTrigger', role: 'Heading button that opens its panel.' },
      { name: 'AccordionPanel', role: 'Content associated with the trigger.' },
    ],
  },
  alert: {
    usage: {
      import: "import { Alert } from '@21stgov/commons-react'",
      example: `<Alert variant="success" heading="Application submitted">
  Your confirmation number is PR-2026-1042.
</Alert>`,
    },
  },
  'aspect-ratio': {
    usage: {
      import: "import { AspectRatio } from '@21stgov/commons-react'",
      example: `<AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md">
  <img
    src="/community-center.jpg"
    alt="Community center entrance"
    className="size-full object-cover"
  />
</AspectRatio>`,
    },
  },
  avatar: {
    usage: {
      import:
        "import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@21stgov/commons-react'",
      example: `<div className="flex items-center gap-2">
  <Avatar size="lg">
    <AvatarImage src="/staff/maya-chen.jpg" alt="" />
    <AvatarFallback>MC</AvatarFallback>
    <AvatarBadge label="Available" />
  </Avatar>
  <div>
    <p>Maya Chen</p>
    <p>Permit specialist · Available</p>
  </div>
</div>`,
    },
    composition: [
      { name: 'Avatar', role: 'Neutral identity root and size owner.' },
      { name: 'AvatarImage', role: 'Image with required alt-text decision.' },
      { name: 'AvatarFallback', role: 'Brief substitute while the image is unavailable.' },
      { name: 'AvatarBadge', role: 'Optional decorative or text-labelled status marker.' },
      { name: 'AvatarGroup', role: 'RTL-safe overlapping identity collection.' },
      { name: 'AvatarGroupCount', role: 'Visible and announced omitted-person count.' },
    ],
  },
  badge: {
    usage: {
      import:
        "import { Badge, RemovableTag, Tag } from '@21stgov/commons-react'",
      example: `<div className="flex flex-wrap gap-1">
  <Badge variant="success">Approved</Badge>
  <Tag>Public works</Tag>
  <RemovableTag
    label="Road closures"
    onRemove={() => removeFilter('Road closures')}
  />
</div>`,
    },
    composition: [
      { name: 'Badge', role: 'Compact visible status or count label.' },
      { name: 'Tag', role: 'Static category or taxonomy label.' },
      { name: 'RemovableTag', role: 'Applied token with a named 44px native remove button.' },
    ],
  },
  breadcrumb: {
    usage: {
      import:
        "import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from '@21stgov/commons-react'",
      example: `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbItem><BreadcrumbLink href="/services">Services</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbItem><BreadcrumbPage>Permits</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
    },
    composition: [
      { name: 'Breadcrumb', role: 'Navigation landmark and accessible label.' },
      { name: 'BreadcrumbList', role: 'Ordered trail container.' },
      { name: 'BreadcrumbItem', role: 'One level and its decorative separator.' },
      { name: 'BreadcrumbLink', role: 'Link to an ancestor page.' },
      { name: 'BreadcrumbPage', role: 'Current page, never a link.' },
    ],
  },
  button: {
    usage: {
      import: "import { Button } from '@21stgov/commons-react'",
      example: `<Button variant="primary">Submit application</Button>`,
    },
  },
  card: {
    usage: {
      import:
        "import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@21stgov/commons-react'",
      example: `<Card>
  <CardHeader>
    <CardTitle headingLevel="h3">Building permits</CardTitle>
    <CardDescription>Applications, inspections, and status.</CardDescription>
  </CardHeader>
  <CardContent>Start or continue a permit application.</CardContent>
  <CardFooter>
    <a href="/permits">View permit services</a>
  </CardFooter>
</Card>`,
    },
    composition: [
      { name: 'CardGroup', role: 'Responsive semantic list of related cards.' },
      { name: 'CardItem', role: 'One list item in a CardGroup.' },
      { name: 'Card', role: 'Neutral visual container and layout owner.' },
      { name: 'CardHeader', role: 'Title, description, and optional action grid.' },
      { name: 'CardTitle', role: 'Heading at the consumer-selected outline level.' },
      { name: 'CardDescription', role: 'Concise supporting summary.' },
      { name: 'CardAction', role: 'Optional header action or compact metadata.' },
      { name: 'CardMedia', role: 'Full-bleed or inset neutral media wrapper.' },
      { name: 'CardContent', role: 'Main card body.' },
      { name: 'CardFooter', role: 'Actions or secondary metadata.' },
    ],
  },
  carousel: {
    usage: {
      import:
        "import { Carousel, CarouselContent, CarouselControls, CarouselItem, CarouselNext, CarouselPrevious, CarouselStatus } from '@21stgov/commons-react'",
      example: `<Carousel label="Featured city services">
  <CarouselContent>
    <CarouselItem>Building permits</CarouselItem>
    <CarouselItem>Trash and recycling</CarouselItem>
    <CarouselItem>Public meetings</CarouselItem>
  </CarouselContent>
  <CarouselControls>
    <CarouselPrevious />
    <CarouselStatus />
    <CarouselNext />
  </CarouselControls>
</Carousel>`,
    },
    composition: [
      { name: 'Carousel', role: 'Named region, Embla state, keyboard direction, and live status.' },
      { name: 'CarouselContent', role: 'Clipped swipe viewport and slide track.' },
      { name: 'CarouselItem', role: 'Named slide group occupying one snap.' },
      { name: 'CarouselControls', role: 'Separated navigation row that cannot overlap the viewport.' },
      { name: 'CarouselPrevious', role: 'Native 44px previous-slide button.' },
      { name: 'CarouselNext', role: 'Native 44px next-slide button.' },
      { name: 'CarouselStatus', role: 'Visible API-backed “Slide X of Y” position.' },
      { name: 'CarouselDots', role: 'Optional named direct-navigation buttons with current state.' },
    ],
  },
  checkbox: {
    usage: {
      import: "import { Checkbox } from '@21stgov/commons-react'",
      example: `<Checkbox
  label="Get service alerts"
  description="Water, power, and road closure updates."
/>`,
    },
  },
  collection: {
    usage: {
      import:
        "import { Collection, CollectionContent, CollectionDescription, CollectionItem, CollectionMeta, CollectionMetaItem, CollectionTitle } from '@21stgov/commons-react'",
      example: `<Collection>
  <CollectionItem>
    <CollectionContent>
      <CollectionTitle href="/notices/oak-street">
        Oak Street water-main work
      </CollectionTitle>
      <CollectionDescription>
        Crews will maintain local access throughout construction.
      </CollectionDescription>
      <CollectionMeta>
        <CollectionMetaItem>Updated today</CollectionMetaItem>
        <CollectionMetaItem>Public Works</CollectionMetaItem>
      </CollectionMeta>
    </CollectionContent>
  </CollectionItem>
</Collection>`,
    },
    composition: [
      { name: 'Collection', role: 'Semantic short list with regular or condensed rhythm.' },
      { name: 'CollectionItem', role: 'One independently understandable list item.' },
      { name: 'CollectionMedia', role: 'Optional thumbnail, seal, icon, or calendar date.' },
      { name: 'CollectionCalendarDate', role: 'Machine-readable date with a full spoken label.' },
      { name: 'CollectionContent', role: 'Title, summary, and metadata column.' },
      { name: 'CollectionTitle', role: 'Consumer-level heading containing the primary link.' },
      { name: 'CollectionDescription', role: 'Concise supporting summary.' },
      { name: 'CollectionMeta', role: 'Semantic compact metadata list.' },
      { name: 'CollectionMetaItem', role: 'One metadata value.' },
    ],
  },
  dialog: {
    usage: {
      import:
        "import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@21stgov/commons-react'",
      example: `<Dialog>
  <DialogTrigger>Delete record</DialogTrigger>
  <DialogContent>
    <DialogTitle>Delete this record?</DialogTitle>
    <DialogDescription>This action cannot be undone.</DialogDescription>
    <DialogFooter>
      <DialogClose>Cancel</DialogClose>
      <Button variant="danger">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
    },
    composition: [
      { name: 'Dialog', role: 'Root that owns open state and modal behavior.' },
      { name: 'DialogTrigger', role: 'Button that opens the dialog.' },
      { name: 'DialogContent', role: 'Portal, backdrop, and modal surface.' },
      { name: 'DialogTitle', role: 'Required accessible name.' },
      {
        name: 'DialogDescription',
        role: 'Supporting description announced by assistive technology.',
      },
      { name: 'DialogFooter', role: 'Responsive action layout.' },
      { name: 'DialogClose', role: 'Action that closes and returns focus.' },
    ],
  },
  field: {
    usage: {
      import: "import { Field, Input } from '@21stgov/commons-react'",
      example: `<Field label="Email address" hint="We only use this to reply." required>
  <Input type="email" autoComplete="email" />
</Field>`,
    },
  },
  footer: {
    usage: {
      import:
        "import { Footer, FooterBottom, FooterCopyright, FooterLink, FooterNav, FooterSection } from '@21stgov/commons-react'",
      example: `<Footer>
  <FooterNav>
    <FooterSection heading="Services">
      <FooterLink href="/permits">Permits and licenses</FooterLink>
      <FooterLink href="/payments">Pay a bill</FooterLink>
    </FooterSection>
  </FooterNav>
  <FooterBottom agencyName="City of Springfield" />
  <FooterCopyright>City of Springfield</FooterCopyright>
</Footer>`,
    },
    composition: [
      { name: 'Footer', role: 'Site-footer landmark and visual surface.' },
      { name: 'FooterNav', role: 'Labelled footer navigation.' },
      { name: 'FooterSection', role: 'Heading and related link group.' },
      { name: 'FooterLink', role: 'Consistently styled footer link.' },
      { name: 'FooterBottom', role: 'Agency identity and contact area.' },
      {
        name: 'FooterCopyright',
        role: 'Final ownership line with an automatically current local year.',
      },
    ],
  },
  'gov-banner': {
    usage: {
      import: "import { GovBanner } from '@21stgov/commons-react'",
      example: `<GovBanner
  entity="the City of Springfield"
  brandMark={<img src="/city-seal.svg" alt="" />}
/>`,
    },
  },
  header: {
    usage: {
      import:
        "import { Header, HeaderMenuButton, HeaderNav, HeaderNavLink, HeaderTitle } from '@21stgov/commons-react'",
      example: `<Header>
  <HeaderTitle title="City of Springfield" href="/" />
  <HeaderMenuButton />
  <HeaderNav>
    <HeaderNavLink href="/services" current>Services</HeaderNavLink>
    <HeaderNavLink href="/contact">Contact</HeaderNavLink>
  </HeaderNav>
</Header>`,
    },
    composition: [
      { name: 'Header', role: 'Banner landmark and responsive state owner.' },
      { name: 'HeaderTitle', role: 'Site-title home link.' },
      { name: 'HeaderMenuButton', role: 'Mobile navigation disclosure.' },
      { name: 'HeaderNav', role: 'Primary navigation landmark.' },
      { name: 'HeaderNavLink', role: 'Navigation link with current-page state.' },
    ],
  },
  identifier: {
    usage: {
      import:
        "import { Identifier, IdentifierIdentity, IdentifierLink, IdentifierLinks } from '@21stgov/commons-react'",
      example: `<Identifier>
  <IdentifierIdentity agencyName="City of Springfield" domain="springfield.example" />
  <IdentifierLinks>
    <IdentifierLink href="/accessibility">Accessibility</IdentifierLink>
    <IdentifierLink href="/privacy">Privacy</IdentifierLink>
  </IdentifierLinks>
</Identifier>`,
    },
    composition: [
      { name: 'Identifier', role: 'Outer agency-identity band.' },
      { name: 'IdentifierIdentity', role: 'Agency name, parent, and domain.' },
      { name: 'IdentifierLinks', role: 'Labelled policy-link navigation.' },
      { name: 'IdentifierLink', role: 'Required or agency-specific link.' },
      {
        name: 'IdentifierResource',
        role: 'Optional, fully localizable pointer to a useful local service or contact.',
      },
    ],
  },
  input: {
    usage: {
      import: "import { Field, Input } from '@21stgov/commons-react'",
      example: `<Field label="Case number" hint="Printed on your notice.">
  <Input name="caseNumber" autoComplete="off" />
</Field>`,
    },
  },
  link: {
    usage: {
      import: "import { Link } from '@21stgov/commons-react'",
      example: `<Link href="/services/permits">Apply for a permit</Link>`,
    },
  },
  pagination: {
    usage: {
      import:
        "import { Pagination, PaginationItem, PaginationList, PaginationNext, PaginationPage, PaginationPrevious } from '@21stgov/commons-react'",
      example: `<Pagination>
  <PaginationList>
    <PaginationItem><PaginationPrevious href="?page=1" /></PaginationItem>
    <PaginationItem><PaginationPage href="?page=1">1</PaginationPage></PaginationItem>
    <PaginationItem><PaginationPage current href="?page=2">2</PaginationPage></PaginationItem>
    <PaginationItem><PaginationNext href="?page=3" /></PaginationItem>
  </PaginationList>
</Pagination>`,
    },
    composition: [
      { name: 'Pagination', role: 'Navigation landmark and accessible label.' },
      { name: 'PaginationList', role: 'Ordered list of page controls.' },
      { name: 'PaginationItem', role: 'One control slot.' },
      { name: 'PaginationPrevious', role: 'Previous-page link or button.' },
      { name: 'PaginationPage', role: 'Numbered page with current-page support.' },
      { name: 'PaginationEllipsis', role: 'Decorative omitted-page marker.' },
      { name: 'PaginationNext', role: 'Next-page link or button.' },
    ],
  },
  'radio-group': {
    usage: {
      import: "import { Radio, RadioGroup } from '@21stgov/commons-react'",
      example: `<RadioGroup label="Preferred contact method" required>
  <Radio label="Email" value="email" />
  <Radio label="Phone" value="phone" />
  <Radio label="Mail" value="mail" />
</RadioGroup>`,
    },
    composition: [
      { name: 'RadioGroup', role: 'Fieldset, legend, hint, and shared state.' },
      { name: 'Radio', role: 'One mutually exclusive option.' },
    ],
  },
  select: {
    usage: {
      import: "import { Field, Select } from '@21stgov/commons-react'",
      example: `<Field label="Department">
  <Select placeholder="Choose a department">
    <option value="public-works">Public Works</option>
    <option value="parks">Parks and Recreation</option>
  </Select>
</Field>`,
    },
  },
  tabs: {
    usage: {
      import:
        "import { Tabs, TabsList, TabsPanel, TabsTab } from '@21stgov/commons-react'",
      example: `<Tabs defaultValue="overview">
  <TabsList aria-label="Permit details">
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="documents">Documents</TabsTab>
  </TabsList>
  <TabsPanel value="overview">Application status and summary.</TabsPanel>
  <TabsPanel value="documents">Submitted supporting documents.</TabsPanel>
</Tabs>`,
    },
    composition: [
      { name: 'Tabs', role: 'Root that owns selection, orientation, and direction.' },
      { name: 'TabsList', role: 'Named tablist and keyboard-navigation owner.' },
      { name: 'TabsTab', role: 'One roving-tabindex selection control.' },
      { name: 'TabsPanel', role: 'Content associated with one tab value.' },
    ],
  },
  tooltip: {
    usage: {
      import:
        "import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@21stgov/commons-react'",
      example: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Parcel ID format</TooltipTrigger>
    <TooltipContent>Two letters followed by eight numbers.</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    },
    composition: [
      { name: 'TooltipProvider', role: 'Shares accessible open and close delays.' },
      { name: 'Tooltip', role: 'Root that owns visibility and dismissal.' },
      { name: 'TooltipTrigger', role: 'The described focusable control.' },
      { name: 'TooltipContent', role: 'Brief, non-interactive description.' },
    ],
  },
}
