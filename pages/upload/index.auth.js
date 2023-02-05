import { useEffect, useRef, useState } from 'react';
import cx from 'classnames';

import { useAuth } from '@nokkio/auth';
import { useNavigate } from '@nokkio/router';

export function getPageMetadata() {
  return { title: 'Photo Roll: Upload' }
}

function Step({ number, label, complete = false, active }) {
  const wrapperClasses = cx('flex', 'items-center', 'space-x-3', {
    ['text-indigo-700']: active,
    ['text-gray-700']: complete,
    ['text-gray-400']: !complete && !active,
  });

  const circleClasses = cx(
    'w-8',
    'h-8',
    'rounded-full',
    'border-2',
    'flex',
    'items-center',
    'justify-center',
    {
      ['text-white']: complete,
      ['border-green-600']: complete,
      ['bg-green-600']: complete,
      ['border-indigo-400']: active,
    },
  );

  return (
    <div className={wrapperClasses}>
      <div className={circleClasses}>{complete ? <Check /> : number}</div>
      <span>{label}</span>
    </div>
  );
}

function Check() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function SelectImageStep({ onSelect }) {
  const fileInput = useRef();

  useEffect(() => {
    fileInput.current.addEventListener('change', (e) => {
      onSelect(e.target.files[0]);
    });
  }, []);

  return (
    <button
      onClick={() => fileInput.current.click()}
      className="w-full bg-gray-50 border-t p-6 text-gray-400 text-center"
    >
      Click here to select an image to upload.
      <input ref={fileInput} type="file" accept="image/*" className="hidden" />
    </button>
  );
}

function ImagePreview({ file }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    const reader = new FileReader();

    reader.addEventListener(
      'load',
      function() {
        setSrc(reader.result);
      },
      false,
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  }, [file]);

  return src ? (
    <img src={src} />
  ) : (
    <div className="w-full bg-gray-50 border-t p-6 text-gray-400 text-center">
      Loading...
    </div>
  );
}

function CaptionStep({ onComplete }) {
  function handleSubmit(e) {
    e.preventDefault();
    onComplete(e.target.elements.caption.value);
  }

  return (
    <form
      className="flex w-full bg-gray-50 border-t px-6 py-3 text-gray-400 text-center"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        name="caption"
        className="bg-white px-2 py-1 border border-indigo-100 w-full focus:text-gray-900 focus:ring-1 ring-inset outline-none text-sm"
        placeholder="enter a caption"
      />
      <button className="bg-indigo-700 text-sm text-indigo-50 px-3 py-2 rounded-r">
        Publish
      </button>
    </form>
  );
}

function PublishStep({ progress }) {
  const p = Math.round((progress.loaded / progress.total) * 100);

  return (
    <div className="relative w-full bg-gray-50 border-t text-center">
      <p className="px-2 py-3 text-sm text-gray-500">Publishing...</p>
      <div
        style={{ width: p + '%' }}
        className="absolute h-0.5 top-0 left-0 bg-indigo-700 transition-all duration-500"
      ></div>
    </div>
  );
}

export default function Upload() {
  const [step, setStep] = useState(1);
  const [payload, setPayload] = useState({});
  const [progress, setProgress] = useState({ loaded: 0, total: 1 });
  const { user } = useAuth();
  const navigate = useNavigate();

  function handleImageSelect(image) {
    setPayload({ image });
    setStep(2);
  }

  function handleCaption(caption) {
    setStep(3);

    user.createPhoto({ ...payload, caption }, setProgress).then(() => {
      navigate('/');
    });
  }

  return (
    <div className="bg-white shadow">
      <div className="p-6 flex flex-col space-y-2 font-medium md:flex-row  md:justify-between md:items-center md:space-y-0 md:flex-row">
        <Step
          number={1}
          label="Select image"
          complete={step > 1}
          active={step === 1}
        />
        <Step
          number={2}
          label="Caption"
          complete={step > 2}
          active={step === 2}
        />
        <Step number={3} label="Publish" active={step === 3} />
      </div>
      {step === 1 && <SelectImageStep onSelect={handleImageSelect} />}
      {step === 2 && <CaptionStep onComplete={handleCaption} />}
      {step === 3 && <PublishStep progress={progress} />}
      {payload.image && <ImagePreview file={payload.image} />}
    </div>
  );
}
