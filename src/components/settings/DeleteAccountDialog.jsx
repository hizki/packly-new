import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { User } from '@/api/entities';
import { PackingList } from '@/api/entities';
import { BaseList } from '@/api/entities';
import { TipList } from '@/api/entities';
import { toast } from '@/components/ui/use-toast';

export default function DeleteAccountDialog({ open, onOpenChange }) {
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAllUserData = async (userId) => {
    try {
      // Delete all packing lists
      const packingLists = await PackingList.filter({ owner_id: userId });
      for (const list of packingLists) {
        await PackingList.delete(list.id);
      }

      // Delete all base lists
      const baseLists = await BaseList.filter({ owner_id: userId });
      for (const list of baseLists) {
        await BaseList.delete(list.id);
      }

      // Delete all tip lists
      const tipLists = await TipList.filter({ owner_id: userId });
      for (const list of tipLists) {
        await TipList.delete(list.id);
      }

      // Delete user data stored in User entity
      await User.updateMyUserData({
        has_initialized_base_lists: false,
        // Add any other user-specific data fields that need to be reset
      });

    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete all user data');
    }
  };

  const handleDelete = async () => {
    if (confirmation.toLowerCase() !== 'delete my account') {
      toast({
        title: "Error",
        description: "Please type the confirmation text exactly as shown",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      const currentUser = await User.me();
      
      // First delete all user data
      await deleteAllUserData(currentUser.id);

      // Then logout the user
      await User.logout();
      
      toast({
        title: "Account Data Deleted",
        description: "Your account data has been deleted and you've been logged out.",
      });
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Error during account deletion:', error);
      toast({
        title: "Error",
        description: "Failed to delete account data. Please try again.",
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Account Data
          </DialogTitle>
          <DialogDescription className="text-base">
            This action cannot be undone. This will permanently delete all your data from our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-50 border border-red-100 rounded-md p-4">
            <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
              <li>All your packing lists will be permanently deleted</li>
              <li>All your customized base lists will be removed</li>
              <li>Your account settings will be reset</li>
              <li>You will be immediately logged out</li>
              <li>This cannot be undone</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-mono font-bold">delete my account</span> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="delete my account"
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmation.toLowerCase() !== 'delete my account'}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting Account Data...
              </>
            ) : (
              'Delete Account Data'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}