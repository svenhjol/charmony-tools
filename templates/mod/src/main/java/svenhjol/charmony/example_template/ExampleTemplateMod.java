package svenhjol.charmony.example_template;

import net.minecraft.resources.ResourceLocation;
import svenhjol.charmony.api.core.ModDefinition;
import svenhjol.charmony.api.core.Side;
import svenhjol.charmony.core.base.Mod;

@ModDefinition(
    id = ExampleTemplateMod.ID,
    sides = {Side.Client, Side.Common},
    name = "ExampleName",
    description = "ExampleDescription.")
public final class ExampleTemplateMod extends Mod {
    public static final String ID = "charmony-example-template";
    private static ExampleTemplateMod instance;

    private ExampleTemplateMod() {}

    public static ExampleTemplateMod instance() {
        if (instance == null) {
            instance = new ExampleTemplateMod();
        }
        return instance;
    }

    public static ResourceLocation id(String path) {
        return ResourceLocation.fromNamespaceAndPath(ID, path);
    }
}