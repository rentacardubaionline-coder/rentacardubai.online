import { Flag, PlusSquare, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { whatsappUrl } from "@/lib/contact";

interface VendorInfoCardProps {
  business: any;
}

export function VendorInfoCard({ business }: VendorInfoCardProps) {
  const workingHours = typeof business.working_hours === 'string' 
    ? { default: business.working_hours }
    : business.working_hours as Record<string, string> | null;

  // claim_status: 'unclaimed' | 'pending' | 'claimed'
  const claimStatus: string = business.claim_status ?? "unclaimed";

  return (
    <div className="space-y-6">
      {/* Verification Status / Claim Card */}
      {claimStatus === "unclaimed" ? (
        <div className="bg-[#333333] rounded-2xl p-6 text-center text-white shadow-lg ring-1 ring-black/10">
          <div className="mb-4">
            <h3 className="text-base font-bold leading-tight">This business isn't claimed yet?</h3>
            <p className="text-xs text-white/50 mt-1">Are you from this company?</p>
          </div>
          
          <div className="space-y-4 mt-6">
            <a 
              href={whatsappUrl(`Hi RentNow, I am the owner of ${business.name} and I would like to claim my business listing on your platform. Please let me know the verification process.`)}
              target="_blank"
              rel="nofollow noopener"
              className="group flex items-center justify-center gap-2 text-sm font-bold underline underline-offset-4 decoration-white/20 hover:decoration-brand-400 transition-all text-white"
            >
              <Flag className="h-4 w-4 fill-white group-hover:fill-brand-400 group-hover:text-brand-400" />
              Claim this business
            </a>

            <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Or</div>

            <Link 
              href="/dashboard/business/add"
              className="group flex items-center justify-center gap-2 text-sm font-bold underline underline-offset-4 decoration-white/20 hover:decoration-brand-400 transition-all"
            >
              <PlusSquare className="h-4 w-4 group-hover:text-brand-400" />
              Add your own business
            </Link>
          </div>
        </div>
      ) : claimStatus === "claimed" ? (
        <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100 flex items-center gap-4">
          <div className="h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-brand-600">Verified Business</div>
            <p className="text-xs text-brand-600/70 font-medium">Authenticity confirmed by RentNow</p>
          </div>
        </div>
      ) : (
        /* pending — vendor-created, awaiting admin review; show nothing */
        null
      )}
    </div>
  );
}



