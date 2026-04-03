import React, { useState, useRef, useEffect } from 'react';
import { Share2, Link, Facebook, Twitter, Mail, Check, X } from 'lucide-react';
import { videoService } from '../../services/video.service';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ShareButtonProps {
  videoId: string;
  title: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ videoId, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const videoUrl = `${window.location.origin}/video/${videoId}`;
  const embedCode = `<iframe width="560" height="315" src="${window.location.origin}/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(8, rect.right - 320), // 320 is the dropdown width (w-80)
      });
    }
  }, [isOpen]);

  const handleShare = async (platform: string) => {
    try {
      await videoService.incrementShareCount(videoId);
    } catch (error) {
      console.error('Error incrementing share count:', error);
    }

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(videoUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${videoUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(videoUrl)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async (text: string, type: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      await videoService.incrementShareCount(videoId);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
      >
        <Share2 size={18} />
        <span>Share</span>
      </button>

      <AnimatePresence>
        {isOpen && createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Share Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
              className="fixed w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Share Video</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Social Media Buttons */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-800 hover:bg-blue-600 rounded-lg transition-colors"
                  title="Share on Facebook"
                >
                  <Facebook size={24} />
                  <span className="text-xs">Facebook</span>
                </button>

                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-800 hover:bg-sky-500 rounded-lg transition-colors"
                  title="Share on Twitter"
                >
                  <Twitter size={24} />
                  <span className="text-xs">Twitter</span>
                </button>

                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-800 hover:bg-green-600 rounded-lg transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-xs">WhatsApp</span>
                </button>

                <button
                  onClick={() => handleShare('email')}
                  className="flex flex-col items-center gap-2 p-3 bg-slate-800 hover:bg-purple-600 rounded-lg transition-colors"
                  title="Share via Email"
                >
                  <Mail size={24} />
                  <span className="text-xs">Email</span>
                </button>
              </div>

              {/* Copy Link */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Video Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={videoUrl}
                      readOnly
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(videoUrl, 'link')}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check size={18} /> : <Link size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Embed Code</label>
                  <div className="flex gap-2">
                    <textarea
                      value={embedCode}
                      readOnly
                      rows={2}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs font-mono resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(embedCode, 'embed')}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors flex items-center gap-2 self-start"
                    >
                      {copied ? <Check size={18} /> : <Link size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {copied && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-sm text-green-400 flex items-center gap-2"
                >
                  <Check size={16} />
                  Copied to clipboard!
                </motion.div>
              )}
            </motion.div>
          </>,
          document.body
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareButton;
