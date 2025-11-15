import React from "react";
import { View } from "react-native";
import CustomInput from "@/components/CustomInput";
import CustomDatePicker from "@/components/CustomDatePicker";
import CustomDropdown from "@/components/CustomDropdown";
import CustomCheckbox from "@/components/CustomCheckbox";
import { Control } from "react-hook-form";
import { brazilStates } from "@/helpers/states";
import { ContactType } from "@/enums/contactType";

type ProfileFormProps<T> = {
  control: Control<T>;
  onCepChange: (cep: string) => void;
};

export default function ProfileForm<T>({ control, onCepChange }: ProfileFormProps<T>) {
  return (
    <View style={{ marginBottom: 24 }}>
      <CustomInput control={control as any} name="email" label="E-mail" placeholder="E-mail" editable={false} />
      <CustomInput control={control as any} name="name" label="Nome Completo" placeholder="Digite seu nome completo" editable={false} />

      <CustomDatePicker control={control as any} name="birthDate" label="Data de Nascimento" placeholder="DD/MM/AAAA" />

      <CustomInput control={control as any} name="cpf" label="CPF" placeholder="000.000.000-00" keyboardType="numeric" />
      <CustomInput control={control as any} name="phone" label="Telefone" placeholder="(11) 99999-9999" keyboardType="phone-pad" />
      <CustomInput control={control as any} name="cep" label="CEP" placeholder="00000-000" keyboardType="numeric" onChangeText={onCepChange} />

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <CustomInput control={control as any} name="address" label="Endereço" placeholder="Rua, Avenida, etc." />
        </View>
        <View style={{ flex: 0.5, marginLeft: 8 }}>
          <CustomInput control={control as any} name="number" label="Número" placeholder="123" />
        </View>
      </View>

      <CustomInput control={control as any} name="neighborhood" label="Bairro" placeholder="Nome do bairro" />

      <CustomDropdown
        name="state"
        control={control as any}
        label="Estado"
        options={brazilStates.map((s) => ({ label: s.name, value: s.uf }))}
      />

      <CustomInput control={control as any} name="city" label="Cidade" placeholder="Nome da cidade" />
      <CustomInput control={control as any} name="complement" label="Complemento (opcional)" placeholder="Apartamento, bloco, etc." />
      <CustomInput control={control as any} name="bio" label="Sobre você" placeholder="Conte um pouco sobre você e sua experiência com pets..." multiline style={{ height: 100, textAlignVertical: 'top' }} numberOfLines={4} />

      <CustomCheckbox control={control as any} name="notifications" label="Receber notificações" />

      <CustomDropdown
        name="contactType"
        control={control as any}
        label="Tipo de Contato"
        options={[
          { label: "Apenas pelo App", value: ContactType.App.toString() },
          { label: "Apenas por Telefone", value: ContactType.Phone.toString() },
          { label: "App e Telefone", value: ContactType.Both.toString() },
        ]}
      />
    </View>
  );
}


