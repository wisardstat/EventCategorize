-- Add missing fields to tb_setting table
ALTER TABLE public.tb_setting 
ADD COLUMN set_description TEXT NULL,
ADD COLUMN create_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN update_datetime TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have default timestamps
UPDATE public.tb_setting 
SET create_datetime = CURRENT_TIMESTAMP,
    update_datetime = CURRENT_TIMESTAMP
WHERE create_datetime IS NULL;