"use client";

import { useActionState } from "react";
import { saveDesigner } from "@/app/actions/designers";
import { FormMessage } from "../FormMessage";
import { SubmitButton } from "../SubmitButton";

type DesignerValues = {
  id?: string;
  name?: string;
  bio?: string | null;
  country?: string | null;
  website?: string | null;
  instagram?: string | null;
  shopUrl?: string | null;
};

export function DesignerForm({ designer = {} }: { designer?: DesignerValues }) {
  const [state, action] = useActionState(saveDesigner, undefined);
  return (
    <form action={action} className="space-y-5">
      <FormMessage state={state} />
      {designer.id && <input type="hidden" name="id" value={designer.id} />}
      <div>
        <label className="label" htmlFor="name">Designer name</label>
        <input className="input" id="name" name="name" defaultValue={designer.name} required />
      </div>
      <div>
        <label className="label" htmlFor="bio">Short bio</label>
        <textarea className="input min-h-28" id="bio" name="bio" defaultValue={designer.bio ?? ""} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="country">Country</label>
          <input className="input" id="country" name="country" defaultValue={designer.country ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="instagram">Instagram username</label>
          <input className="input" id="instagram" name="instagram" placeholder="without the @" defaultValue={designer.instagram ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="website">Website</label>
          <input className="input" id="website" name="website" type="url" placeholder="https://" defaultValue={designer.website ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="shopUrl">Shop (books, diagrams)</label>
          <input className="input" id="shopUrl" name="shopUrl" type="url" placeholder="https://" defaultValue={designer.shopUrl ?? ""} />
        </div>
      </div>
      <SubmitButton className="btn-primary">{designer.id ? "Save changes" : "Create designer entry"}</SubmitButton>
    </form>
  );
}
