import { MerchantRegistryAdmin } from "@/components/merchant-registry-admin"

export default function MerchantRegistryPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Merchant Registry Admin</h1>
          <p className="text-muted-foreground mt-2">
            Approve or reject merchant registrations on the blockchain
          </p>
        </div>
        
        <div className="flex justify-center">
          <MerchantRegistryAdmin />
        </div>
      </div>
    </div>
  )
} 