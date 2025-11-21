
import React, { useState, useRef } from 'react';
import { storage, ref, uploadBytes, getDownloadURL, addDoc, collection, db } from '../services/firebase';

const UploadPage: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
      }
  };

  const handleUpload = async () => {
      if (!file) return;
      setUploading(true);

      try {
          // Upload to Storage
          const storageRef = ref(storage, `videos/${Date.now()}_${file.name}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);

          // Create Firestore Record
          await addDoc(collection(db, "videos"), {
              title: title || file.name,
              description: description,
              embedUrl: url,
              thumbnail: "https://picsum.photos/seed/upload/600/400",
              views: "0",
              rating: 0,
              likes: 0,
              dislikes: 0,
              duration: 0, // Default 0ms, processed later
              performers: [],
              tags: ['upload', 'new'],
              category: "New Arrivals",
              author: "You",
              createdAt: new Date()
          });

          alert("Upload Successful!");
          setFile(null);
          setTitle('');
          setDescription('');
      } catch (e) {
          console.error("Upload failed", e);
          alert("Upload failed. See console.");
      } finally {
          setUploading(false);
      }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
       <h1 className="text-3xl font-bold text-white mb-8">Upload Content</h1>

       {!file ? (
           <div
             className={`border-2 border-dashed ${isDragging ? 'border-brand-500 bg-brand-900/20' : 'border-gray-700 bg-dark-card/50'} rounded-3xl p-16 text-center transition-all cursor-pointer`}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             onClick={() => fileInputRef.current?.click()}
           >
              <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileSelect} />
              <i className="fa-solid fa-cloud-arrow-up text-6xl text-gray-600 mb-6"></i>
              <h2 className="text-2xl font-bold text-white mb-2">Drag and drop video files</h2>
              <p className="text-gray-400">or click to browse your files</p>
           </div>
       ) : (
           <div className="bg-dark-card p-8 rounded-2xl border border-gray-800">
               <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-brand-900/50 rounded-lg flex items-center justify-center text-brand-500">
                       <i className="fa-solid fa-video"></i>
                   </div>
                   <div>
                       <p className="text-white font-bold">{file.name}</p>
                       <p className="text-xs text-gray-500">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                   </div>
                   <button onClick={() => setFile(null)} className="ml-auto text-gray-500 hover:text-white"><i className="fa-solid fa-times"></i></button>
               </div>

               <div className="space-y-4 mb-6">
                   <div>
                       <label className="block text-xs text-gray-400 mb-1">Title</label>
                       <input
                         type="text"
                         value={title}
                         onChange={e => setTitle(e.target.value)}
                         className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-brand-500"
                         placeholder="Video Title"
                       />
                   </div>
                   <div>
                       <label className="block text-xs text-gray-400 mb-1">Description</label>
                       <textarea
                         value={description}
                         onChange={e => setDescription(e.target.value)}
                         className="w-full bg-black/30 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-brand-500 h-24"
                         placeholder="Describe your video..."
                       />
                   </div>
               </div>

               <button
                 onClick={handleUpload}
                 disabled={uploading}
                 className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
               >
                  {uploading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Uploading...</>
                  ) : (
                      <><i className="fa-solid fa-upload"></i> Publish Video</>
                  )}
               </button>
           </div>
       )}
    </div>
  );
};

export default UploadPage;
