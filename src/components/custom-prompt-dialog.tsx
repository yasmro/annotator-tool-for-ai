import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useEditorContext, DEFAULT_REQUIREMENTS } from "@/contexts/editor-context"
import { useLanguage } from "@/contexts/language-context"

export function CustomPromptDialog() {
  const { t } = useLanguage()
  const { customRequirements, setCustomRequirements } = useEditorContext()
  const [open, setOpen] = useState(false)
  const [tempRequirements, setTempRequirements] = useState(customRequirements)

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setTempRequirements(customRequirements)
    }
    setOpen(isOpen)
  }

  const handleSave = () => {
    setCustomRequirements(tempRequirements)
    setOpen(false)
  }

  const handleReset = () => {
    setTempRequirements(DEFAULT_REQUIREMENTS)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-1 h-4 w-4" />
          {t.customPromptSettings}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[70vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{t.customPromptSettings}</DialogTitle>
          <DialogDescription>{t.customPromptDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden py-4 flex flex-col min-h-0">
          <Label htmlFor="requirements" className="mb-2 block flex-shrink-0">
            {t.implementationRequirements}
          </Label>
          <Textarea
            id="requirements"
            value={tempRequirements}
            onChange={(e) => setTempRequirements(e.target.value)}
            className="flex-1 resize-none font-mono text-sm"
          />
        </div>
        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReset} className="mr-auto">
            {t.resetToDefault}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave}>{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
