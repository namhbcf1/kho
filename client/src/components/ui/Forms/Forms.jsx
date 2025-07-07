import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Textarea } from '../textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';
import { Checkbox } from '../checkbox';
import { RadioGroup, RadioGroupItem } from '../radio-group';
import { Badge } from '../badge';
import { AlertCircle, Check, X, Upload, Calendar, Clock } from 'lucide-react';

const Forms = {
  // Form Container
  FormContainer: ({ children, title, subtitle, onSubmit, className = '' }) => (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {children}
        </form>
      </CardContent>
    </Card>
  ),

  // Form Field with Validation
  FormField: ({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    error, 
    required = false,
    placeholder,
    disabled = false,
    helperText,
    children
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {children || (
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
        />
      )}
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  ),

  // Select Field
  SelectField: ({ 
    label, 
    name, 
    value, 
    onChange, 
    options = [], 
    error, 
    required = false,
    placeholder = "Select an option",
    disabled = false
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  ),

  // Textarea Field
  TextareaField: ({ 
    label, 
    name, 
    value, 
    onChange, 
    error, 
    required = false,
    placeholder,
    disabled = false,
    rows = 3
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={error ? 'border-red-500' : ''}
      />
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  ),

  // Checkbox Field
  CheckboxField: ({ 
    label, 
    name, 
    checked, 
    onChange, 
    error, 
    disabled = false,
    description
  }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          name={name}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
        </Label>
      </div>
      
      {description && (
        <p className="text-sm text-gray-500 ml-6">{description}</p>
      )}
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  ),

  // Radio Group Field
  RadioGroupField: ({ 
    label, 
    name, 
    value, 
    onChange, 
    options = [], 
    error, 
    required = false,
    disabled = false
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={option.value} />
            <Label htmlFor={option.value} className="text-sm">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  ),

  // File Upload Field
  FileUploadField: ({ 
    label, 
    name, 
    onChange, 
    error, 
    required = false,
    accept,
    multiple = false,
    disabled = false
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Click to upload or drag and drop
        </p>
        <input
          id={name}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onChange}
          disabled={disabled}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById(name).click()}
          disabled={disabled}
        >
          Choose Files
        </Button>
      </div>
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  ),

  // Date Field
  DateField: ({ 
    label, 
    name, 
    value, 
    onChange, 
    error, 
    required = false,
    disabled = false,
    min,
    max
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type="date"
          value={value}
          onChange={onChange}
          disabled={disabled}
          min={min}
          max={max}
          className={error ? 'border-red-500' : ''}
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  ),

  // Time Field
  TimeField: ({ 
    label, 
    name, 
    value, 
    onChange, 
    error, 
    required = false,
    disabled = false
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type="time"
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={error ? 'border-red-500' : ''}
        />
        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  ),

  // Form Actions
  FormActions: ({ 
    onCancel, 
    onSubmit, 
    loading = false, 
    cancelText = "Cancel", 
    submitText = "Submit",
    className = ''
  }) => (
    <div className={`flex items-center justify-end space-x-3 pt-4 ${className}`}>
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelText}
        </Button>
      )}
      <Button type="submit" disabled={loading} onClick={onSubmit}>
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Loading...
          </>
        ) : (
          submitText
        )}
      </Button>
    </div>
  ),

  // Form Grid Layout
  FormGrid: ({ children, columns = 2, className = '' }) => (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6 ${className}`}>
      {children}
    </div>
  ),

  // Form Section
  FormSection: ({ title, children, className = '' }) => (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="border-b pb-2">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  ),

  // Validation Summary
  ValidationSummary: ({ errors = [] }) => {
    if (errors.length === 0) return null;

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <h4 className="text-sm font-medium text-red-800">
            Please fix the following errors:
          </h4>
        </div>
        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      </div>
    );
  }
};

export default Forms; 