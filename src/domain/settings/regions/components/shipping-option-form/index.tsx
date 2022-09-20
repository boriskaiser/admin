import { Region } from "@medusajs/medusa" //ShippingOptionPriceType.CALCULATED
import clsx from "clsx"
import React from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import IncludesTaxTooltip from "../../../../../components/atoms/includes-tax-tooltip"
import Switch from "../../../../../components/atoms/switch"
import InputHeader from "../../../../../components/fundamentals/input-header"
import InputField from "../../../../../components/molecules/input"
import { NextSelect } from "../../../../../components/molecules/select/next-select"
import RadioGroup from "../../../../../components/organisms/radio-group"
import { Option } from "../../../../../types/shared"
import FormValidator from "../../../../../utils/form-validator"
import PriceFormInput from "../../../../products/components/prices-form/price-form-input"
import { useShippingOptionFormData } from "./use-shipping-option-form-data"

enum ShippingOptionPriceType {
  CALCULATED = "calculated",
  FLAT_RATE = "flat_rate",
}

type Requirement = {
  amount: number | null
  id: string | null
}

export type ShippingOptionFormType = {
  store_option: boolean
  name: string | null
  amount: number | null
  price_type: string
  shipping_profile: Option | null
  fulfillment_provider: Option | null
  requirements: {
    min_subtotal: Requirement | null
    max_subtotal: Requirement | null
  }
}

type Props = {
  form: UseFormReturn<ShippingOptionFormType, any>
  region: Region
  isEdit?: boolean
}

const ShippingOptionForm = ({ form, region, isEdit = false }: Props) => {
  const {
    register,
    control,
    formState: { errors },
  } = form

  const watchPriceType = form.watch("price_type")

  const {
    shippingProfileOptions,
    fulfillmentOptions,
  } = useShippingOptionFormData(region.id)

  return (
    <div>
      <div>
        <div
          className={clsx("flex mt-2", {
            "flex-col": !isEdit,
            "justify-between": isEdit,
          })}
        >
          <h3 className="inter-base-semibold mb-base">Price Type</h3>
          <Controller
            control={control}
            defaultValue={ShippingOptionPriceType.FLAT_RATE}
            name={"price_type"}
            render={({ field: { value, onChange } }) => {
              return isEdit ? (
                <span>{value}</span>
              ) : (
                <RadioGroup.Root
                  value={value}
                  onValueChange={isEdit ? undefined : onChange}
                  className={"flex items-center gap-base mb-xlarge"}
                >
                  <RadioGroup.Item
                    value={ShippingOptionPriceType.FLAT_RATE}
                    className="flex-1"
                    label="Flat Rate"
                    description={"Shipping rate is a fixed amount"}
                  />
                  <RadioGroup.Item
                    value={ShippingOptionPriceType.CALCULATED}
                    className="flex-1"
                    label="Calculated"
                    description={"Shipping rate is determined on runtime"}
                  />
                </RadioGroup.Root>
              )
            }}
          />
        </div>
        <div className="flex flex-col gap-y-2xsmall">
          <div className="flex items-center justify-between">
            <h3 className="inter-base-semibold mb-2xsmall">Visible in store</h3>
            <Controller
              control={control}
              name={"store_option"}
              render={({ field: { value, onChange } }) => {
                return <Switch checked={value} onCheckedChange={onChange} />
              }}
            />
          </div>
          <p className="inter-base-regular text-grey-50">
            Enable or disable the shipping option visiblity in store.
          </p>
        </div>
      </div>
      <div className="h-px w-full bg-grey-20 my-xlarge" />
      <div>
        <h3 className="inter-base-semibold mb-base">Details</h3>
        <div className="grid grid-cols-2 gap-large">
          <InputField
            label="Title"
            required
            {...register("name", {
              required: "Title is required",
              pattern: FormValidator.whiteSpaceRule("Title"),
              minLength: FormValidator.minOneCharRule("Title"),
            })}
            errors={errors}
          />
          <Controller
            control={control}
            name="amount"
            rules={{
              min: FormValidator.nonNegativeNumberRule("Price"),
              max: FormValidator.maxInteger("Price", region.currency_code),
            }}
            render={({ field: { value, onChange } }) => {
              return (
                <div>
                  <InputHeader
                    label="Price"
                    className="mb-xsmall"
                    tooltip={
                      <IncludesTaxTooltip includesTax={region.includes_tax} />
                    }
                  />
                  <PriceFormInput
                    disabled={
                      watchPriceType === ShippingOptionPriceType.CALCULATED
                    }
                    amount={value || undefined}
                    onChange={onChange}
                    name="amount"
                    currencyCode={region.currency_code}
                    errors={errors}
                  />
                </div>
              )
            }}
          />
          {!isEdit && (
            <>
              <Controller
                control={control}
                name="shipping_profile"
                render={({ field }) => {
                  return (
                    <NextSelect
                      label="Shipping Profile"
                      required
                      options={shippingProfileOptions}
                      placeholder="Choose a shipping profile"
                      {...field}
                      errors={errors}
                    />
                  )
                }}
              />
              <Controller
                control={control}
                name="fulfillment_provider"
                render={({ field }) => {
                  return (
                    <NextSelect
                      label="Fulfillment Method"
                      required
                      placeholder="Choose a fulfillment method"
                      options={fulfillmentOptions}
                      {...field}
                      errors={errors}
                    />
                  )
                }}
              />
            </>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-grey-20 my-xlarge" />
      <div>
        <h3 className="inter-base-semibold mb-base">Requirements</h3>
        <div className="grid grid-cols-2 gap-large">
          <Controller
            control={control}
            name="requirements.min_subtotal.amount"
            rules={{
              min: FormValidator.nonNegativeNumberRule("Min. subtotal"),
              max: FormValidator.maxInteger(
                "Min. subtotal",
                region.currency_code
              ),
              validate: (value) => {
                if (!value) {
                  return true
                }

                const maxSubtotal = form.getValues(
                  "requirements.max_subtotal.amount"
                )
                if (maxSubtotal && value > maxSubtotal) {
                  return "Min. subtotal must be less than max. subtotal"
                }
                return true
              },
            }}
            render={({ field: { value, onChange } }) => {
              return (
                <div>
                  <InputHeader
                    label="Min. subtotal"
                    className="mb-xsmall"
                    tooltip={
                      <IncludesTaxTooltip includesTax={region.includes_tax} />
                    }
                  />
                  <PriceFormInput
                    amount={value || undefined}
                    onChange={onChange}
                    name="requirements.min_subtotal.amount"
                    currencyCode={region.currency_code}
                    errors={errors}
                  />
                </div>
              )
            }}
          />
          <Controller
            control={control}
            name="requirements.max_subtotal.amount"
            rules={{
              min: FormValidator.nonNegativeNumberRule("Max. subtotal"),
              max: FormValidator.maxInteger(
                "Max. subtotal",
                region.currency_code
              ),
              validate: (value) => {
                if (!value) {
                  return true
                }

                const minSubtotal = form.getValues(
                  "requirements.min_subtotal.amount"
                )
                if (minSubtotal && value < minSubtotal) {
                  return "Max. subtotal must be greater than min. subtotal"
                }
                return true
              },
            }}
            render={({ field: { value, onChange, ref } }) => {
              return (
                <div ref={ref}>
                  <InputHeader
                    label="Max. subtotal"
                    className="mb-xsmall"
                    tooltip={
                      <IncludesTaxTooltip includesTax={region.includes_tax} />
                    }
                  />
                  <PriceFormInput
                    amount={value || undefined}
                    onChange={onChange}
                    name="requirements.max_subtotal.amount"
                    currencyCode={region.currency_code}
                    errors={errors}
                  />
                </div>
              )
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default ShippingOptionForm
