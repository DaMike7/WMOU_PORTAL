// src/components/student/PaymentUpload.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../../services/paymentService';
import { toast } from 'react-hot-toast';
import { Upload, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function PaymentUpload({ course, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ courseId, amountPaid, file }) =>
      paymentService.uploadPaymentProof(courseId, amountPaid, file),
    onSuccess: () => {
      toast.success('Payment proof uploaded successfully!');
      queryClient.invalidateQueries(['studentCourses']);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to upload payment proof');
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview for image files
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    uploadMutation.mutate({
      courseId: course.id,
      amountPaid: course.fee,
      file,
    });
  };

  return (
    <div className="space-y-6">
      {/* Course Details */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-bold text-lg mb-2 text-gray-900">{course.title}</h3>
        <p className="text-sm text-gray-600 mb-1">
          Course Code: <span className="font-mono font-semibold">{course.course_code}</span>
        </p>
        <p className="text-sm text-gray-600 mb-2">
          Department: <span className="font-semibold">{course.department}</span>
        </p>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(course.fee)}
        </p>
      </div>

      {/* Bank Details */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
        <h3 className="font-bold text-lg mb-3 text-gray-900">Bank Transfer Details</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Bank Name:</span>
            <span className="font-semibold">Fidelity Bank</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Number:</span>
            <span className="font-mono font-bold">4010955962</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Account Name:</span>
            <span className="font-semibold">Nnewi School Of Economics</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="text-gray-600 font-medium">Amount:</span>
            <span className="font-bold text-green-600">
              {formatCurrency(course.fee)}
            </span>
          </div>
          <div className="border-t pt-2 mt-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Payment Description:</span>
              <br />
              <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded mt-1 inline-block">
                {course.course_code} - {course.session} - {course.semester}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Upload Receipt */}
      <div>
        <h3 className="font-bold text-lg mb-3 text-gray-900">Upload Payment Receipt</h3>
        <p className="text-sm text-gray-600 mb-4">
          After making the transfer, upload a screenshot or photo of your payment receipt.
        </p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
          <input
            type="file"
            id="receipt-upload"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <label
            htmlFor="receipt-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {preview ? (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="max-h-48 rounded-lg shadow-md"
                />
              </div>
            ) : (
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
            )}
            <p className="text-sm font-medium text-gray-700 mb-1">
              {file ? file.name : 'Click to upload receipt'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG up to 10MB
            </p>
          </label>
        </div>

        {file && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span className="truncate">{file.name}</span>
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="text-red-600 hover:text-red-800 ml-auto"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t">
        <button
          onClick={() => onSuccess()}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
       <button
          onClick={handleUpload}
          disabled={uploadMutation.isLoading || !file}
          className="flex-1 px-4 py-3 bg-[#1e3a5f] text-white rounded-lg font-medium hover:bg-[#2d5a8f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {uploadMutation.isLoading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/80 border-t-transparent animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Submit Receipt
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your payment will be reviewed within 24-48 hours
      </p>
    </div>
  );
}